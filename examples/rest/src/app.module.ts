import { Module } from "@threadws/loom-core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { OtherController } from "./other.controller";
import { TestMiddleware } from "./test.middleware";

@Module({
  providers: [TestMiddleware, AppService],
  controllers: [AppController, OtherController],
  modules: [],
})
export class AppModule {}
