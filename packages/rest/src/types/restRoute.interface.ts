import type { ZodType } from "zod/v4";

import type { HttpMethods } from "@loom/common";
import type { LoomMiddleware } from "../middleware";

export interface RestRoute {
  methods: HttpMethods[];
  path: string;
  target: object;
  parent?: object;
  middleware?: LoomMiddleware[];
  inputSchema?: ZodType<any>;
  outputSchema?: ZodType<any>;
  handler?: Function;
}
