import { Service } from "@threadws/loom-core";

@Service()
export class AppService {
  getHello(): string {
    return "Hello From App Service!";
  }
}
