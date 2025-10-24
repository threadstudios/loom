import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  type GraphQLArgument,
  type GraphQLArgumentConfig,
  type GraphQLField,
  type GraphQLFieldConfig,
  type GraphQLFieldConfigMap,
  type GraphQLInputFieldConfig,
  type GraphQLInputType,
  type GraphQLResolveInfo,
} from "graphql";
import "reflect-metadata";
import { match } from "ts-pattern";
import { Container } from "typedi";
import type { Loom__GraphQLMetadata } from "./gql.meta";
import {
  MetaObjectType,
  MetaParamType,
  type ArgMetadata,
  type GQLContext,
  type MetaOperationType,
  type ParamMetadata,
  type ResolveFieldMetadata,
  type TypeRegistry,
} from "./gql.types";
import type { LoomGuard } from "./guard";
import { argMetadataFromParamMetadata } from "./mapper/argMetadataFromParamMetadata";
import { typeToGraphQLType } from "./mapper/typeToGraphQLType";

export class LoomGqlSchemaBuilder {
  private metadata: Loom__GraphQLMetadata;

  constructor(metadata: Loom__GraphQLMetadata) {
    this.metadata = metadata;
  }

  private compileTypes() {
    const nextTypeRegistry: TypeRegistry = {
      objectType: new Map(),
      inputType: new Map(),
    };

    this.metadata.getAllObjects().forEach((objectType) => {
      if (!objectType.fields) return;
      const objectDefinitionType = this.metadata.objectTypeRegistry.get(
        objectType.name
      );
      match(objectDefinitionType)
        .with(MetaObjectType.Object, () => {
          const fields: Record<
            string,
            GraphQLFieldConfig<
              unknown,
              Record<string, unknown>,
              Record<string, unknown>
            >
          > = {};
          for (const [fieldKey, fieldValue] of Object.entries(
            objectType.fields
          )) {
            const { returnType, ...rest } = fieldValue;
            fields[fieldKey] = {
              type: typeToGraphQLType(returnType, nextTypeRegistry.objectType),
              ...rest,
            };
          }
          nextTypeRegistry.objectType.set(
            objectType.name,
            new GraphQLObjectType({
              name: objectType.name,
              fields: () => fields,
            })
          );
        })
        .with(MetaObjectType.Input, () => {
          const fields: Record<string, GraphQLInputFieldConfig> = {};
          for (const [fieldKey, fieldValue] of Object.entries(
            objectType.fields
          )) {
            const { returnType, ...rest } = fieldValue;
            fields[fieldKey] = {
              type: typeToGraphQLType(returnType, nextTypeRegistry.inputType),
              ...rest,
            };
          }
          nextTypeRegistry.inputType.set(
            objectType.name,
            new GraphQLInputObjectType({
              name: objectType.name,
              fields: () => fields,
              isOneOf: false,
            })
          );
        })
        .otherwise(() => {
          throw new Error(`Unknown object type: ${objectDefinitionType}`);
        });
    });
    return nextTypeRegistry;
  }

  private buildField(
    fieldResolver: ResolveFieldMetadata,
    outputTypeRegistry: TypeRegistry["objectType"],
    inputTypeRegistry: TypeRegistry["inputType"]
  ): GraphQLField<unknown, GQLContext, Record<string, unknown>> {
    const resolverArgs = this.metadata.getArguments(
      `${fieldResolver.resolverTarget.constructor.name}:${fieldResolver.method.name}`
    );

    return {
      name: fieldResolver.method.name as string,
      type: typeToGraphQLType(fieldResolver.returnType, outputTypeRegistry),
      args: argMetadataFromParamMetadata(resolverArgs).map(
        (arg): GraphQLArgument => ({
          name: arg.name,
          type: arg.arguments.nullable
            ? typeToGraphQLType(arg.arguments.returnType, inputTypeRegistry)
            : new GraphQLNonNull(
                typeToGraphQLType(arg.arguments.returnType, inputTypeRegistry)
              ),
          description: null,
          defaultValue: arg.arguments.defaultValue,
          deprecationReason: null,
          extensions: {},
          astNode: undefined,
        })
      ),
      extensions: {},
      astNode: undefined,
      description: fieldResolver.description || null,
      deprecationReason: fieldResolver.deprecationReason || null,
      resolve: this.buildResolver(
        fieldResolver.method,
        fieldResolver.resolverTarget,
        resolverArgs
      ),
      ...fieldResolver,
    };
  }

  private buildResolver(
    resolverFn: Function,
    parentClass: any,
    operationArgs?: ParamMetadata<any>[],
    guards?: LoomGuard[]
  ) {
    return async (
      parent: any,
      args: any,
      context: GQLContext,
      _info: GraphQLResolveInfo
    ) => {
      const isAuth = await Promise.all(
        guards?.map((g) =>
          Container.get(g).canActivate(context.req, context.custom)
        ) || []
      );
      if (isAuth.includes(false)) {
        throw new Error("Unauthorized");
      }
      const orderedArgs = Array.from({ length: resolverFn.length });
      orderedArgs[0] = parent;
      if (operationArgs) {
        for (const argMeta of operationArgs) {
          match(argMeta.paramType)
            .with(MetaParamType.Ctx, () => {
              const narrowed = Array.isArray(argMeta.arguments)
                ? argMeta.arguments[0]
                : argMeta.arguments;
              orderedArgs[argMeta.index] = narrowed
                ? context.custom[narrowed]
                : context.custom;
            })
            .with(MetaParamType.Info, () => {
              orderedArgs[argMeta.index] = _info;
            })
            .with(MetaParamType.Parent, () => {
              orderedArgs[argMeta.index] = parent;
            })
            .with(MetaParamType.Arg, () => {
              orderedArgs[argMeta.index] = args[argMeta.name];
            })
            .exhaustive();
        }
      }

      console.log(parentClass);

      return await resolverFn.call(
        Container.get(parentClass.constructor),
        ...orderedArgs
      );
    };
  }

  private buildGraphQLFieldArgs(
    opArgs: ArgMetadata[],
    typeRegistry: TypeRegistry
  ): Record<string, GraphQLArgumentConfig> {
    const args: Record<string, GraphQLArgumentConfig> = {};
    for (const arg of opArgs) {
      const baseType = typeToGraphQLType<GraphQLInputType>(
        arg.arguments.returnType,
        typeRegistry.inputType
      );
      args[arg.name] = {
        type: arg.arguments.nullable ? baseType : new GraphQLNonNull(baseType),
        defaultValue: arg.arguments.defaultValue,
      };
    }

    return args;
  }

  buildSchema() {
    const typeRegistry = this.compileTypes();

    this.metadata.getFieldResolvers().forEach((fieldResolver) => {
      const resolver = this.metadata.getResolver(
        fieldResolver.resolverTarget.constructor.name
      );
      const baseObject = typeRegistry.objectType.get(
        resolver?.objectType().name
      );
      const fields = baseObject?.getFields();
      if (!fields) return;
      fields[fieldResolver.method.name as string] = this.buildField(
        fieldResolver,
        typeRegistry.objectType,
        typeRegistry.inputType
      );
    });

    const operations: Record<
      MetaOperationType,
      GraphQLFieldConfigMap<unknown, GQLContext>
    > = {
      query: {},
      mutation: {},
      subscription: {},
    };

    this.metadata.getAllOperations().forEach((operation) => {
      const { operationType, ...rest } = operation;
      const operationArgs = this.metadata.getArguments(
        `${operation.target.constructor.name}:${operation.method.name}`
      );
      const guards = [
        ...this.metadata.getGuards(
          `${operation.target.constructor.name}:${operation.method.name}`
        ),
        ...this.metadata.getGuards(operation.target.constructor.name),
      ];

      const opArgs = this.buildGraphQLFieldArgs(
        operationArgs.filter(
          (arg) => arg.paramType === MetaParamType.Arg
        ) as ArgMetadata[],
        typeRegistry
      );

      operations[operationType][operation.name] = {
        type: typeToGraphQLType(operation.returnType, typeRegistry.objectType),
        ...rest,
        args: opArgs,
        resolve: this.buildResolver(
          operation.method,
          operation.target,
          operationArgs,
          guards
        ),
      };
    });

    const schemaConfig: any = {};

    if (Object.keys(operations.query).length > 0) {
      schemaConfig.query = new GraphQLObjectType({
        name: "Query",
        fields: operations.query,
      });
    }

    if (Object.keys(operations.mutation).length > 0) {
      schemaConfig.mutation = new GraphQLObjectType({
        name: "Mutation",
        fields: operations.mutation,
      });
    }

    if (Object.keys(operations.subscription).length > 0) {
      schemaConfig.subscription = new GraphQLObjectType({
        name: "Subscription",
        fields: operations.subscription,
      });
    }

    return new GraphQLSchema(schemaConfig);
  }
}
