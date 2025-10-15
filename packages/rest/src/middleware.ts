import type { LoomRequest } from "@threadws/loom-common";

export abstract class LoomMiddlewareClass {
  abstract run(request: LoomRequest): Promise<void>;
}

export type LoomMiddleware = new (...args: any[]) => LoomMiddlewareClass;
