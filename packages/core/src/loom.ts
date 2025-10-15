import type { LoomPlugin, Route } from "@loom/common";
import { Logger, LoomInstance } from "@loom/common";
import bun from "bun";
import Container from "typedi";

type plugin = () => { routes?: Route[] };

export type LoomOptions = {
  modules: Function[];
  plugins?: plugin[];
};

export class Loom implements LoomInstance {
  private routes: Route[] = [];
  private logger: ReturnType<Logger["getChild"]>;

  constructor({ modules }: { modules: Function[] }) {
    const masterLogger = new Logger();
    Container.set(Logger, masterLogger);
    this.logger = masterLogger.getChild("core");

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

  listen(port: number) {
    bun.serve({
      port: 3165,
      routes: {
        "/": () => new Response("Hello World"),
        ...this.routes.reduce(
          (acc: Record<string, Route["handler"]>, route) => {
            this.logger.info(
              `Registering route: [${route.methods.join(",")}] ${route.path}`
            );
            acc[`${route.path}`] = route.handler;
            return acc;
          },
          {}
        ),
      },
    });
  }
}
