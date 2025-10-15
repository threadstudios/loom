import "reflect-metadata";
import Container from "typedi";
import { Loom__GraphQLMetadata } from "../gql.meta";
import { type FieldOptions } from "../gql.types";

export const RESOLVE_FIELD_METADATA_KEY = Symbol(
  "LOOM_GQL_RESOLVE_FIELD_METADATA"
);

export function ResolveField(returnType: () => any, options?: FieldOptions) {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(
      RESOLVE_FIELD_METADATA_KEY,
      { returnType, options },
      target,
      propertyKey
    );

    const meta = Container.get(Loom__GraphQLMetadata);

    meta.registerFieldResolver({
      method: descriptor.value,
      returnType: returnType,
      resolverTarget: target,
      ...options,
    });
  };
}
