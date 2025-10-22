import type { BunRequest } from "bun";

export type BunServeHttpMethods =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";

export type CompiledRoutes = Record<
  string,
  {
    [key in BunServeHttpMethods]?: (request: BunRequest) => Promise<Response>;
  }
>;
