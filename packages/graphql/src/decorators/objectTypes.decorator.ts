import "reflect-metadata";
import Container from "typedi";
import { Loom__GraphQLMetadata } from "../gql.meta";
import { MetaObjectType } from "../gql.types";

export function ObjectType() {
  return (target: any) => {
    Container.get(Loom__GraphQLMetadata).objectTypeRegistry.set(
      target.name,
      MetaObjectType.Object
    );
  };
}

export function InputType() {
  return (target: any) => {
    Container.get(Loom__GraphQLMetadata).objectTypeRegistry.set(
      target.name,
      MetaObjectType.Input
    );
  };
}
