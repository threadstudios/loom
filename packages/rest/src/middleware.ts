import type { LoomRequest } from "@loom/common";

export abstract class LoomMiddlewareClass {
  abstract run(request: LoomRequest): Promise<void>;
}

export type LoomMiddleware = new (...args: any[]) => LoomMiddlewareClass;
