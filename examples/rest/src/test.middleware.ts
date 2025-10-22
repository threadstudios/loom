import { type LoomRequest } from "@threadws/loom-common";
import { Service } from "@threadws/loom-core";
import type { LoomMiddlewareClass } from "@threadws/loom-rest";

@Service()
export class TestMiddleware implements LoomMiddlewareClass {
  async run(request: LoomRequest<{ userId: string }>): Promise<void> {
    request.requestContext.set("userId", "12345");
    console.log("TestMiddleware executed, userId set in context.");
  }
}
