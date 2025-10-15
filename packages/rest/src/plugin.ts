import { HttpMethods, LoomInstance } from "@threadws/loom-common";
import type { BunRequest } from "bun";
import Container from "typedi";
import { restRouteToRoute } from "./mapper/restRouteToRoute";
import { RouterToOpenApi } from "./openapi";
import { Loom__RouterCache } from "./route.cache";
import { renderHTML } from "./scalar/render";

type LoomRestPluginOptions = {
  withScalar?: boolean;
};

export const LoomRestPlugin =
  (options: LoomRestPluginOptions = {}) =>
  (instance: LoomInstance) => {
    const routerCache = Container.get(Loom__RouterCache);

    const allRoutes = routerCache.getAllRoutes();

    for (const route of allRoutes) {
      const mappedRoute = restRouteToRoute({
        routerCache,
        restRoute: route,
      });
      if (mappedRoute) {
        instance.addRoute(mappedRoute);
      }
    }

    if (options.withScalar) {
      instance.addRoute({
        path: "/docs/openapi.json",
        methods: [HttpMethods.Get],
        handler: async (request: BunRequest) => {
          const generatedDocument = new RouterToOpenApi(routerCache).generate({
            name: "Loom API",
            version: "1.0.0",
            baseUrl: request.url.replace("docs/openapi.json", ""),
          });
          return Response.json(generatedDocument);
        },
      });
      instance.addRoute({
        path: "/docs",
        methods: [HttpMethods.Get],
        handler: async (request: BunRequest) => {
          return new Response(
            renderHTML({ baseUrl: request.url.replace(/\/docs$/, "") }),
            { headers: { "Content-Type": "text/html" } }
          );
        },
      });
    }
  };
