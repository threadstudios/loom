import type { BunRequest } from "bun";
import type { HttpMethods } from "./enums/httpMethods.enum";

export abstract class LoomInstance {
  constructor({
    modules,
    applicationName,
  }: {
    modules: Function[];
    applicationName?: string;
  }) {}

  applicationName: string;

  abstract addRoute(route: Route): void;

  abstract use(plugin: LoomPlugin): void;

  abstract listen(port: number): void;
}

export type LoomPlugin = (instance: LoomInstance) => void;

export interface Route {
  methods: HttpMethods[];
  path: string;
  handler: (request: BunRequest) => Promise<Response> | Response;
}
