import Container from "typedi";
import { Loom__GraphQLMetadata } from "../gql.meta";
import { MetaParamType, type ParamMetadata } from "../gql.types";

function createParamDecorator<T>(type: MetaParamType) {
  return (query?: T) =>
    (target: object, propertyKey: string | symbol, parameterIndex: number) => {
      const argMetadata: ParamMetadata<T> = {
        name: type,
        paramType: type,
        index: parameterIndex,
        arguments: query,
      };

      const gqlCache = Container.get(Loom__GraphQLMetadata);
      const key = `${target.constructor.name}:${propertyKey.toString()}`;
      gqlCache.addArgument(key, argMetadata);
    };
}

export const Parent = createParamDecorator<string>(MetaParamType.Parent);
export const Ctx = createParamDecorator<string>(MetaParamType.Ctx);
export const Info = createParamDecorator(MetaParamType.Info);
