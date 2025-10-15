import { Controller, Get } from "@threadws/loom-rest";

@Controller("/other")
export class OtherController {
  @Get("/hello")
  hello() {
    return new Response("Hello from Other Controller");
  }
}
