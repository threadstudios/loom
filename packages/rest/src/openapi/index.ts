import type {
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathsObject,
  SchemaObject,
} from "openapi3-ts/oas30";
import { toJSONSchema } from "zod";
import { getControllerRoute } from "../decorators/controller.decorator";
import type { Loom__RouterCache } from "../route.cache";
import type { ValidRestRoute } from "../schema/validRestRoute.schema";

export class RouterToOpenApi {
  private routerCache: Loom__RouterCache;

  constructor(routerCache: Loom__RouterCache) {
    this.routerCache = routerCache;
  }

  private getHeader({
    name,
    version,
    baseUrl,
  }: {
    name: string;
    version: string;
    baseUrl: string;
  }) {
    return {
      openapi: "3.0.0",
      info: {
        title: name || "Your API",
        version: version || "1.0.0",
      },
      servers: baseUrl
        ? [
            {
              url: baseUrl,
            },
          ]
        : [],
    };
  }

  private replacePathParameters(path: string): string {
    return path.replace(/:([^/]+)/g, "{$1}");
  }

  private extractPathParameters(path: string): ParameterObject[] {
    const paramRegex = /:([^/]+)/g;
    const matches = path.matchAll(paramRegex);
    const parameters: ParameterObject[] = [];
    for (const match of matches) {
      if (match[1] === undefined) continue;
      parameters.push({
        name: match[1],
        in: "path" as const,
        required: true,
        schema: { type: "string" as const },
      });
    }
    return parameters;
  }

  private validRestRouteToPathObject(route: ValidRestRoute) {
    const pathItemObject: Record<string, OperationObject> = {};
    const controllerRoute = getControllerRoute(route.target.constructor);

    const routePath = controllerRoute
      ? `${controllerRoute}${route.path ? route.path : ""}`
      : route.path;

    for (const method of route.methods) {
      pathItemObject[method.toLowerCase()] = {
        summary: "",
        responses: {
          200: {
            description: "Successful Response",
            content: route.outputSchema
              ? {
                  "application/json": {
                    schema: {
                      ...toJSONSchema(route.outputSchema, {
                        target: "openapi-3.0",
                      }),
                      additionalProperties: undefined,
                    },
                  },
                }
              : undefined,
          },
        },
        parameters: [...this.extractPathParameters(route.path)],
        requestBody: route.inputSchema
          ? {
              content: {
                "application/json": {
                  schema: {
                    ...(toJSONSchema(route.inputSchema, {
                      target: "openapi-3.0",
                    }) as SchemaObject),
                    additionalProperties: undefined,
                  },
                },
              },
            }
          : undefined,
      };
    }
    return {
      [this.replacePathParameters(routePath)]: pathItemObject,
    };
  }

  generate({
    name,
    version,
    baseUrl,
  }: {
    name: string;
    version: string;
    baseUrl: string;
  }): OpenAPIObject {
    return {
      ...this.getHeader({ name, version, baseUrl }),
      paths: {
        ...this.routerCache.getAllRoutes().reduce((acc: PathsObject, route) => {
          const pathData: PathsObject = this.validRestRouteToPathObject(route);
          acc = { ...acc, ...pathData };
          return acc;
        }, {}),
      },
    };
  }
}
