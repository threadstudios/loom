import "reflect-metadata";
import { Service } from "typedi";

export function Schema() {
  return <TFunction extends Function>(ctor: TFunction) => {
    Service()(ctor);
  };
}
