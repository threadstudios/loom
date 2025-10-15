import type { LoomRequest } from "@threadws/loom-common";
import { match, P } from "ts-pattern";

const params = [
  {
    name: "body",
    hasArgs: true,
    fetcher: (req: LoomRequest, id?: string) =>
      id !== undefined ? req.parsedJSON?.[id] : req.parsedJSON,
  },
  {
    name: "query",
    hasArgs: true,
    fetcher: (req: LoomRequest, id?: string) =>
      id !== undefined ? req.query.get(id) : req.query,
  },
  {
    name: "params",
    hasArgs: true,
    fetcher: (req: LoomRequest, id?: keyof LoomRequest["params"]) =>
      id !== undefined ? req.params[id] : req.params,
  },
  {
    name: "cookie",
    hasArgs: true,
    fetcher: (req: LoomRequest, id?: string) => {
      return id !== undefined ? req.cookies.get(id) : req.cookies;
    },
  },
  {
    name: "ctx",
    hasArgs: true,
    fetcher: (req: LoomRequest<Record<string, unknown>>, id?: string) => {
      return id !== undefined
        ? req.requestContext.get(id)
        : req.requestContext.getStore();
    },
  },
];

function createParamDecorator(name: string, hasArgs: boolean) {
  return (...args: unknown[]) =>
    (target: object, propertyKey: string | symbol, parameterIndex: number) => {
      const existingParameters: unknown[] =
        Reflect.getOwnMetadata(`${name}Parameters`, target, propertyKey) || [];
      existingParameters.push(
        hasArgs
          ? { index: parameterIndex, name: args[0] }
          : { index: parameterIndex }
      );
      Reflect.defineMetadata(
        `${name}Parameters`,
        existingParameters,
        target,
        propertyKey
      );
    };
}

export function extractAllParams(
  target: object,
  propertyKey: string | symbol,
  args: unknown[],
  request: LoomRequest,
  response: typeof Response
) {
  for (const { name, fetcher, hasArgs } of params) {
    const parameters: { index: number; name: string }[] =
      Reflect.getOwnMetadata(`${name}Parameters`, target, propertyKey) || [];

    for (const param of parameters) {
      match(name)
        .with(P.union("body", "query", "params", "cookie", "ctx"), () => {
          args[param.index] = hasArgs
            ? fetcher(request, param.name)
            : fetcher(request);
        })
        .with("req", () => {
          args[param.index] = request;
        })
        .with("res", () => {
          args[param.index] = response;
        });
    }
  }
}

export const Body = createParamDecorator("body", true);
export const Query = createParamDecorator("query", true);
export const Param = createParamDecorator("params", true);
export const Cookie = createParamDecorator("cookie", true);
export const Req = createParamDecorator("req", false);
export const Res = createParamDecorator("res", false);
export const Ctx = createParamDecorator("ctx", true);
