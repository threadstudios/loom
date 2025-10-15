import { type LoomRequest } from "@loom/common";
import { Service } from "@loom/core";
import type { LoomMiddlewareClass } from "@loom/rest";

@Service()
export class TestMiddleware implements LoomMiddlewareClass {
  async run(request: LoomRequest<{ userId: string }>): Promise<void> {
    request.requestContext.set("userId", "12345");
  }
}
