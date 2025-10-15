import { match, P } from "ts-pattern";
import Container, { Service } from "typedi";
import { type LoomMiddleware } from "../middleware";
import { Loom__RouterCache } from "../route.cache";

const CONTROLLER_KEY = Symbol("LOOM_CONTROLLER");

export function Controller(
  path: string,
  middlewares?: LoomMiddleware[]
): <TFunction extends Function>(ctor: TFunction) => void;
export function Controller(
  middlewares: LoomMiddleware[]
): <TFunction extends Function>(ctor: TFunction) => void;
export function Controller(
  path?: string
): <TFunction extends Function>(ctor: TFunction) => void;

export function Controller(
  pathOrMiddlewares?: string | LoomMiddleware[],
  middlewares?: LoomMiddleware[]
) {
  return <TFunction extends Function>(ctor: TFunction) => {
    Service()(ctor);

    const routerCache = Container.get(Loom__RouterCache);

    match({ pathOrMiddlewares, middlewares })
      .with(
        {
          pathOrMiddlewares: P.array(P.any),
          middlewares: undefined,
        },
        (res) => {
          routerCache.setGlobalMiddlewares(res.pathOrMiddlewares);
        }
      )
      .with(
        {
          pathOrMiddlewares: P.string,
          middlewares: P.array(P.any),
        },
        (res) => {
          Reflect.defineMetadata(CONTROLLER_KEY, res.pathOrMiddlewares, ctor);
          routerCache.setMiddleware(res.pathOrMiddlewares, res.middlewares);
        }
      )
      .with({ pathOrMiddlewares: P.string, middlewares: P.nullish }, (res) => {
        Reflect.defineMetadata(CONTROLLER_KEY, res.pathOrMiddlewares, ctor);
      })
      .with({ pathOrMiddlewares: P.nullish, middlewares: P.nullish }, () => {
        Reflect.defineMetadata(CONTROLLER_KEY, "", ctor);
      })
      .otherwise(() => {
        console.log({ pathOrMiddlewares, middlewares });
      });
  };
}

export function getControllerRoute(target: object) {
  return Reflect.getMetadata(CONTROLLER_KEY, target);
}
