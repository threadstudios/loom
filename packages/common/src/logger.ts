import { configureSync, getConsoleSink, getLogger } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { Service } from "typedi";

@Service()
export class Logger {
  private instance: ReturnType<typeof getLogger> | undefined;

  constructor() {
    configureSync({
      sinks: {
        console: getConsoleSink({
          formatter: getPrettyFormatter({
            timestamp: "time",
            properties: true,
          }),
        }),
      },
      loggers: [
        { category: "loom", lowestLevel: "debug", sinks: ["console"] },
        { category: ["logtape", "meta"], sinks: [] },
      ],
    });
  }

  get debug() {
    if (!this.instance) {
      this.instance = getLogger("loom");
    }
    return this.instance.debug.bind(this.instance);
  }

  get getChild() {
    if (!this.instance) {
      this.instance = getLogger("loom");
    }
    return this.instance.getChild.bind(this.instance);
  }

  get info() {
    if (!this.instance) {
      this.instance = getLogger("loom");
    }
    return this.instance.info.bind(this.instance);
  }

  get warn() {
    if (!this.instance) {
      this.instance = getLogger("loom");
    }
    return this.instance.warn.bind(this.instance);
  }

  get error() {
    if (!this.instance) {
      this.instance = getLogger("loom");
    }
    return this.instance.error.bind(this.instance);
  }
}
