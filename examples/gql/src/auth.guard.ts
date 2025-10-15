import type { LoomRequest } from "@loom/common";
import { BaseGuard } from "@loom/graphql";

export class AuthGuard implements BaseGuard {
  async canActivate(request: LoomRequest, ctx: { userId: string }) {
    return true;
  }
}
