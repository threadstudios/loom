import { HttpMethods } from "@threadws/loom-common";
import "reflect-metadata";
import { Container } from "typedi";
import type { LoomMiddleware } from "../middleware";
import { Loom__RouterCache } from "../route.cache";

export const ROUTE_METADATA_KEY = Symbol("LOOM_ROUTE_METADATA");

function createMethodDecorator(methods: HttpMethods[]) {
  return (path?: string, middleware?: LoomMiddleware[]) =>
    (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
      const routeKey = `${target.constructor.name}.${propertyKey}`;

      const routeMetadata = {
        methods,
        path,
      };

      Reflect.defineMetadata(
        ROUTE_METADATA_KEY,
        routeMetadata,
        target,
        propertyKey
      );

      const routerCache = Container.get(Loom__RouterCache);
      routerCache.setRoute(routeKey, {
        methods: methods,
        path,
        target,
        parent: target.constructor,
        handler: descriptor.value,
        middleware: middleware || [],
      });
    };
}

export const Get = createMethodDecorator([HttpMethods.Get]);
export const Post = createMethodDecorator([HttpMethods.Post]);
export const Put = createMethodDecorator([HttpMethods.Put]);
export const Delete = createMethodDecorator([HttpMethods.Delete]);
export const Patch = createMethodDecorator([HttpMethods.Patch]);
export const Options = createMethodDecorator([HttpMethods.Options]);
export const Head = createMethodDecorator([HttpMethods.Head]);
export const Many = (methods: HttpMethods[]) => createMethodDecorator(methods);
