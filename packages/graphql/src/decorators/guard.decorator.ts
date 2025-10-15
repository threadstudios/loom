import { match, P } from "ts-pattern";
import Container from "typedi";
import { Loom__GraphQLMetadata } from "../gql.meta";
import type { LoomGuard } from "../guard";

export function Guard(guards: LoomGuard[]): ClassDecorator & MethodDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    const meta = Container.get(Loom__GraphQLMetadata);

    const guardList = guards.length > 0 ? guards : [() => true]; // Default guard that always passes

    match<[unknown, unknown, unknown]>([target, propertyKey, descriptor])
      .with(
        [P.when((t) => typeof t === "function"), P.nullish, P.nullish],
        ([ctor]) => {
          const className = (ctor as Function).name;
          for (const g of guardList) meta.registerGuard(className, g);
        }
      )
      .with(
        [
          P.any,
          P.when((k) => typeof k === "string" || typeof k === "symbol"),
          P.any,
        ],
        ([proto, key]) => {
          const ownerName = (proto as any)?.constructor?.name ?? "Unknown";
          const targetKey = `${ownerName}:${String(key)}`;
          for (const g of guardList) meta.registerGuard(targetKey, g);
        }
      )
      .otherwise(() => {
        throw new Error("Guard decorator applied incorrectly");
      });
  };
}
