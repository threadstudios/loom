import { Logger, type LoomRequest, type Route } from "@threadws/loom-common";
import type { BunRequest } from "bun";
import Container from "typedi";
import { getControllerRoute } from "../decorators/controller.decorator";
import { extractAllParams } from "../decorators/params.decorator";
import { LoomMiddlewareClass, type LoomMiddleware } from "../middleware";
import { asyncLocalStorage, requestContext } from "../requestContext";
import type { Loom__RouterCache } from "../route.cache";
import type { ValidRestRoute } from "../schema/validRestRoute.schema";

export function restRouteToRoute({
  routerCache,
  restRoute,
}: {
  routerCache: Loom__RouterCache;
  restRoute: ValidRestRoute;
}): Route | undefined {
  const controllerRoute = getControllerRoute(restRoute.target.constructor);
  const logger = Container.get(Logger).getChild("REST");
  const controllerMiddlewares: LoomMiddleware[] =
    routerCache.getControllerMiddlewares(controllerRoute);
  const globalMiddlewares: LoomMiddleware[] =
    routerCache.getGlobalMiddlewares();

  const routePath = controllerRoute
    ? `${controllerRoute}${restRoute.path ? restRoute.path : ""}`
    : restRoute.path;

  if (!routePath) {
    logger.error("Invalid Route Specified", { restRoute });
    return;
  }

  return {
    path: routePath,
    methods: restRoute.methods,
    handler: async (request: BunRequest) => {
      logger.info(`Incoming request:`, {
        route: routePath,
      });
      return await asyncLocalStorage.run({}, async () => {
        const { searchParams } = new URL(request.url);
        const req = request.clone();

        let loomRequest: LoomRequest = {
          ...req,
          headers: request.headers,
          cookies: request.cookies,
          method: request.method,
          params: request.params,
          query: searchParams,
          requestContext,
          parsedJSON: request.body
            ? ((await request.json()) as Record<string, unknown>)
            : {},
        };

        const controllerInstance = Container.get(restRoute.target.constructor);
        for (const middleware of [
          ...globalMiddlewares,
          ...controllerMiddlewares,
          ...(restRoute.middleware ?? []),
        ]) {
          const mdx = Container.get(middleware);
          if (mdx instanceof LoomMiddlewareClass) {
            await mdx.run(loomRequest);
          }
        }

        const args = Array.from(
          { length: restRoute.handler.length },
          () => undefined
        );

        extractAllParams(
          restRoute.target,
          restRoute.handler.name,
          args,
          loomRequest
        );

        const result: Response = restRoute.handler.apply(
          controllerInstance,
          args
        );
        logger.info(`Request handled successfully`, {
          route: routePath,
        });
        return result;
      });
    },
  };
}
