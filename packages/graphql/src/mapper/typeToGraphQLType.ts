import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  type GraphQLType,
} from "graphql";
import { match, P } from "ts-pattern";

export function typeToGraphQLType<GraphQLOutputType>(
  type: () => any,
  objects?: Map<string, GraphQLOutputType>
): GraphQLOutputType;
export function typeToGraphQLType<GraphQLInputObjectType>(
  type: () => any,
  objects?: Map<string, GraphQLInputObjectType>
): GraphQLInputObjectType;
export function typeToGraphQLType(
  type: () => any,
  objects?: Map<string, GraphQLType>
): GraphQLType {
  const resolvedType = type();

  if (
    [
      GraphQLBoolean,
      GraphQLFloat,
      GraphQLID,
      GraphQLInt,
      GraphQLString,
    ].includes(resolvedType)
  ) {
    return resolvedType;
  }

  return match<any, GraphQLType>(resolvedType)
    .with(
      P.when((t) => t === String),
      () => GraphQLString
    )
    .with(
      P.when((t) => t === Number),
      () => GraphQLInt
    )
    .with(
      P.when((t) => t === Boolean),
      () => GraphQLBoolean
    )
    .with(
      P.when((t) => t === Date),
      () => GraphQLString
    )
    .with(
      P.array(),
      () => new GraphQLList(typeToGraphQLType(() => resolvedType[0], objects))
    )
    .when(
      (t): t is Function => typeof t === "function" && Boolean((t as any).name),
      (func) => {
        if (!objects?.get((func as any).name)) {
          console.log(
            "Type not found in registry, defaulting to String:",
            (func as any).name,
            objects
          );
        }
        return objects?.get((func as any).name) ?? GraphQLString;
      }
    )
    .otherwise(() => {
      console.log("Unknown type, defaulting to String:", resolvedType);
      return GraphQLString;
    });
}
