import type { LoomRequest } from "@loom/common";
import type {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
} from "graphql";

export enum MetaObjectType {
  Object = "object",
  Input = "input",
}

export enum MetaOperationType {
  Query = "query",
  Mutation = "mutation",
  Subscription = "subscription",
}

export enum MetaParamType {
  Arg = "arg",
  Ctx = "ctx",
  Info = "info",
  Parent = "parent",
}

export type ParamMetadata<T> = {
  index: number;
  name: string;
  paramType: MetaParamType;
  arguments?: T;
};

export interface ArgMetadata extends ParamMetadata<{}> {
  arguments: {
    name: string;
    returnType: LazyReturnType;
    nullable: boolean;
    defaultValue?: any;
  };
}

export type LazyReturnType = () => any | GraphQLType | GraphQLScalarType;

export type FieldMetadata = {
  returnType: LazyReturnType;
  nullable?: boolean;
  description?: string;
  deprecationReason?: string;
};

export interface ResolveFieldMetadata extends FieldMetadata {
  method: Function;
  resolverTarget: any;
}

export type ObjectTypeMetadata = {
  name: string;
  fields: Record<string, FieldMetadata>;
};

export type OperationMetadata = {
  name: string;
  target: object;
  returnType: LazyReturnType;
  operationType: MetaOperationType;
  method: Function;
  description?: string;
  deprecationReason?: string;
};

export type FieldOptions = {
  nullable?: boolean;
  description?: string;
  deprecationReason?: string;
};

export type TypeRegistry = {
  objectType: Map<string, GraphQLObjectType>;
  inputType: Map<string, GraphQLInputObjectType>;
};

export type GQLContext = {
  req: LoomRequest;
  custom: Record<string, unknown>;
};
