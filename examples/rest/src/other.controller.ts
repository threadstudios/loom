import { Controller, Get } from "@loom/rest";

@Controller("/other")
export class OtherController {
  @Get("/hello")
  hello() {
    return new Response("Hello from Other Controller");
  }
}
