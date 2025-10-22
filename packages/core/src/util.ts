import type { BunServeHttpMethods } from "./types";

export function loomMethodToBunServeMethod(
  method: string
): BunServeHttpMethods {
  switch (method.toLowerCase()) {
    case "get":
      return "GET";
    case "post":
      return "POST";
    case "put":
      return "PUT";
    case "delete":
      return "DELETE";
    case "patch":
      return "PATCH";
    case "options":
      return "OPTIONS";
    case "head":
      return "HEAD";
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}
