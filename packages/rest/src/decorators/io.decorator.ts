import Container from "typedi";
import type { ZodType } from "zod/v4";
import { Loom__RouterCache } from "../route.cache";

function IO(type: "input" | "output", schema: ZodType<any>) {
  return (target: object, propertyKey: string | symbol) => {
    const routeKey = `${target.constructor.name}.${propertyKey.toString()}`;
    const routerCache = Container.get(Loom__RouterCache);
    routerCache.setSchemas({
      key: routeKey,
      inputSchema: type === "input" ? schema : undefined,
      outputSchema: type === "output" ? schema : undefined,
    });
  };
}

export function Input(schema: ZodType<any>) {
  return IO("input", schema);
}

export function Output(schema: ZodType<any>) {
  return IO("output", schema);
}
