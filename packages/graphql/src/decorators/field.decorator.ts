import "reflect-metadata";
import Container from "typedi";
import { Loom__GraphQLMetadata } from "../gql.meta";
import { type FieldOptions } from "../gql.types";

const FIELD_METADATA_KEY = Symbol("LOOM_GQL_FIELD_META");

export function Field(returnType: () => any, options?: FieldOptions) {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      FIELD_METADATA_KEY,
      { returnType, options },
      target,
      propertyKey
    );

    const meta = Container.get(Loom__GraphQLMetadata);
    let parentObject = meta.getObject(target.constructor.name);

    if (!parentObject) {
      meta.registerObject({
        name: target.constructor.name,
        fields: {},
      });
      parentObject = meta.getObject(target.constructor.name)!;
    }

    parentObject.fields[propertyKey as string] = {
      returnType: returnType,
      ...options,
    };
  };
}
