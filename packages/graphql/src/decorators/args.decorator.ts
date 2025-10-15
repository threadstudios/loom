import "reflect-metadata";
import Container from "typedi";
import { Loom__GraphQLMetadata } from "../gql.meta";
import { MetaParamType, type ArgMetadata } from "../gql.types";

export function Args(options: {
  name: string;
  type: () => any;
  nullable?: boolean;
  defaultValue?: any;
}) {
  return (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    const argMetadata: ArgMetadata = {
      name: options.name,
      paramType: MetaParamType.Arg,
      arguments: {
        name: options.name,
        returnType: options.type,
        nullable: options.nullable ?? false,
        defaultValue: options.defaultValue,
      },
      index: parameterIndex,
    };

    const gqlCache = Container.get(Loom__GraphQLMetadata);
    const key = `${target.constructor.name}:${propertyKey.toString()}`;
    gqlCache.addArgument(key, argMetadata);
  };
}
