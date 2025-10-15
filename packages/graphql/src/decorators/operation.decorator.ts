import "reflect-metadata";
import Container from "typedi";
import { Loom__GraphQLMetadata } from "../gql.meta";
import { MetaOperationType } from "../gql.types";

export const OPERATION_METADATA_KEY = Symbol("LOOM_GQL_OPERATION_METADATA");

function Operation(operation: MetaOperationType) {
  return (returnType: () => any) => {
    return (
      target: object,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) => {
      Reflect.defineMetadata(
        OPERATION_METADATA_KEY,
        { operation },
        target,
        propertyKey
      );
      const metadata = Container.get(Loom__GraphQLMetadata);

      const originalMethod = descriptor.value;

      metadata.registerOperation({
        name: propertyKey,
        target: target,
        operationType: operation,
        returnType: returnType,
        method: originalMethod,
      });
    };
  };
}

export const Query = Operation(MetaOperationType.Query);
export const Mutation = Operation(MetaOperationType.Mutation);
export const Subscription = Operation(MetaOperationType.Subscription);
