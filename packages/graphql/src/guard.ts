import type { LoomRequest } from "@threadws/loom-common";

export abstract class BaseGuard {
  abstract canActivate(request: LoomRequest, ctx: any): Promise<boolean>;
}

export type LoomGuard = new (...args: any[]) => BaseGuard;
