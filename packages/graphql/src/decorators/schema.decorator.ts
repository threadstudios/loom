import "reflect-metadata";
import { Service } from "typedi";

export function Schema() {
  return (target: Function) => {
    Service()(target.constructor);
  };
}
