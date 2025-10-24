import type { LoomPlugin, Route } from "@threadws/loom-common";
import { Logger, LoomInstance } from "@threadws/loom-common";
import bun from "bun";
import "reflect-metadata";
import Container from "typedi";
import { loomRouteToBunRoute } from "./mapper/loomRouteToBunRoute";
import type { CompiledRoutes } from "./types";
import { loomMethodToBunServeMethod } from "./util";

type plugin = () => { routes?: Route[] };

export type LoomOptions = {
  modules: Function[];
  plugins?: plugin[];
  applicationName?: string;
};

export class Loom implements LoomInstance {
  private routes: Route[] = [];
  private logger: ReturnType<Logger["getChild"]>;

  public applicationName = "Loom App";

  constructor({
    modules,
    applicationName,
  }: {
    modules: Function[];
    applicationName?: string;
  }) {
    const masterLogger = new Logger();
    Container.set(Logger, masterLogger);
    this.logger = masterLogger.getChild("core");
    if (applicationName) {
      this.applicationName = applicationName;
    }

    modules.map(async (module) => {
      Container.get(module);
    });
  }

  addRoute(route: Route): void {
    this.routes.push(route);
  }

  use(plugin: LoomPlugin): void {
    plugin(this);
  }

  listen(
    port: number,
    cors?: {
      origins: string[];
      methods: string[];
      headers?: string[];
      credentials?: boolean;
    }
  ) {
    const headers = new Headers();

    if (cors) {
      headers.set("Access-Control-Allow-Origin", cors.origins.join(", "));
      headers.set("Access-Control-Allow-Methods", cors.methods.join(", "));
      headers.set(
        "Access-Control-Allow-Headers",
        cors.headers?.join(", ") || "*"
      );
      if (cors.credentials) {
        headers.set("Access-Control-Allow-Credentials", "true");
      }
    }

    const compiledRoutes = this.routes.reduce((acc: CompiledRoutes, route) => {
      if (!acc[route.path]) {
        acc[route.path] = {};
      }
      route.methods.forEach((method) => {
        this.logger.info(`Registering route [${method}] ${route.path}`);
        acc[route.path]![loomMethodToBunServeMethod(method)] =
          loomRouteToBunRoute(route, headers);
      });
      return acc;
    }, {});

    if (cors) {
      for (const path in compiledRoutes) {
        compiledRoutes[path]!["OPTIONS"] = async () => {
          return new Response(null, { headers });
        };
      }
    }

    this.logger.info(`Starting server on port ${port}...`);
    bun.serve({
      port: port || 3645,
      routes: compiledRoutes,
    });
  }
}
