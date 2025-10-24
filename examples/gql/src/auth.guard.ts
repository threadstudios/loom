import type { LoomRequest } from "@threadws/loom-common";
import { BaseGuard } from "@threadws/loom-graphql";

export class AuthGuard implements BaseGuard {
  async canActivate(request: LoomRequest, ctx: { userId: string }) {
    ctx.userId = "user-123"; // Simulate authentication and set userId
    return true;
  }
}
