import { Service } from "typedi";
import { parse } from "zod/mini";
import type { ZodType } from "zod/v4";
import type { LoomMiddleware } from "./middleware";
import {
  validRestRouteSchema,
  type ValidRestRoute,
} from "./schema/validRestRoute.schema";
import type { RestRoute } from "./types/restRoute.interface";

@Service()
export class Loom__RouterCache {
  private routeCache: Map<string, Partial<RestRoute>> = new Map();
  private middlewareCache: Map<string, LoomMiddleware[]> = new Map();
  private globalMiddlewares: LoomMiddleware[] = [];

  public getGlobalMiddlewares() {
    return this.globalMiddlewares;
  }

  public setGlobalMiddlewares(middlewares: LoomMiddleware[]) {
    this.globalMiddlewares = [...this.getGlobalMiddlewares(), ...middlewares];
  }

  public getRoute(key: string) {
    return this.routeCache.get(key);
  }

  public setRoute(key: string, value: Partial<RestRoute>) {
    const existing = this.routeCache.get(key);
    this.routeCache.set(key, {
      ...existing,
      ...value,
    });
  }

  public setMiddleware(key: string, value: LoomMiddleware[]) {
    const existing = this.middlewareCache.get(key);
    if (existing) {
      this.middlewareCache.set(key, [...existing, ...value]);
    } else {
      this.middlewareCache.set(key, value);
    }
  }

  public setSchemas({
    key,
    inputSchema,
    outputSchema,
  }: {
    key: string;
    inputSchema?: ZodType<any>;
    outputSchema?: ZodType<any>;
  }) {
    const existingRoute = this.getRoute(key);
    const newInputSchema = inputSchema ?? existingRoute?.inputSchema;
    const newOutputSchema = outputSchema ?? existingRoute?.outputSchema;
    this.setRoute(key, {
      inputSchema: newInputSchema,
      outputSchema: newOutputSchema,
    });
  }

  public hasRoute(key: string) {
    return this.routeCache.has(key);
  }

  public getControllerMiddlewares(path: string): LoomMiddleware[] {
    const middlewares = this.middlewareCache.get(path);
    if (middlewares) {
      return middlewares;
    }
    return [];
  }

  public getAllRoutes(): ValidRestRoute[] {
    return Array.from(this.routeCache.values()).map((route) =>
      parse(validRestRouteSchema, route)
    );
  }
}
