import type { Route } from "@threadws/loom-common";
import type { BunRequest } from "bun";
import { match, P } from "ts-pattern";

export function loomRouteToBunRoute(
  route: Route,
  loomHeaders?: Headers
): (req: BunRequest) => Promise<Response> {
  return async (request: BunRequest) => {
    const response = await route.handler(request);
    response.headers?.forEach((value, key) => {
      loomHeaders?.set(key, value);
    });
    return match(response.body)
      .with(P.string, (body) => {
        return new Response(body, {
          status: response.status || 200,
          headers: loomHeaders,
        });
      })
      .with(P.instanceOf(Response), (body) => {
        loomHeaders?.forEach((value, key) => {
          body.headers.set(key, value);
        });
        return body;
      })
      .otherwise(() => {
        return Response.json(response.body, {
          status: response.status || 200,
          headers: loomHeaders,
        });
      });
  };
}
