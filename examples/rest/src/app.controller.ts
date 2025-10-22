import {
  Body,
  Controller,
  Ctx,
  Get,
  Input,
  Output,
  Param,
  Post,
} from "@threadws/loom-rest";
import z from "zod/v4";
import { AppService } from "./app.service";
import { TestMiddleware } from "./test.middleware";

@Controller([TestMiddleware])
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/hello", [TestMiddleware])
  hello() {
    return new Response(this.appService.getHello());
  }

  @Get("/test/:id", [TestMiddleware])
  test(@Param("id") id: string, @Ctx("userId") userId: string) {
    return `Test ID: ${id}, User ID: ${userId}`;
  }

  @Post("/test")
  @Input(z.object({ name: z.string() }))
  @Output(z.object({ message: z.string() }))
  postTest(@Body("name") name: string) {
    return { message: "Hello " + name };
  }
}
