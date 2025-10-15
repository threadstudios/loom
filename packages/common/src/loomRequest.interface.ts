import type { BunRequest } from "bun";

export interface LoomRequestContext<RC extends Record<string, unknown> = {}> {
  get<K extends keyof RC>(key: K): RC[K] | undefined;
  set<K extends keyof RC>(key: K, value: RC[K]): void;
  getStore(): RC | undefined;
}

export interface LoomRequest<RC extends Record<string, unknown> = {}>
  extends BunRequest {
  params: Record<string, string>;
  parsedJSON?: Record<string, unknown>;
  query: URLSearchParams;
  requestContext: LoomRequestContext<RC>;
}
