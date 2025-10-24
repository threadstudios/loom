import "reflect-metadata";
import Container, { Service } from "typedi";
import { Loom__GraphQLMetadata } from "../gql.meta";

export const RESOLVER_METADATA_KEY = Symbol("LOOM_GQL_RESOLVER_METADATA");

export function Resolver(typeFn: () => any) {
  return <TFunction extends Function>(ctor: TFunction) => {
    Service()(ctor);
    Reflect.defineMetadata(RESOLVER_METADATA_KEY, { type: typeFn }, ctor);
    const meta = Container.get(Loom__GraphQLMetadata);
    meta.registerResolver(ctor.name, {
      objectType: typeFn,
    });
  };
}
