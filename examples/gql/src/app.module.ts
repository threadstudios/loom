import { Module } from "@loom/core";
import { AppService } from "./app.service";
import { TodoResolver } from "./todo.resolver";
import { UserResolver } from "./user.resolver";
import { TodoSchema } from "./todo.schema";

@Module({
  providers: [UserResolver, TodoResolver, AppService, TodoSchema],
  modules: [],
})
export class AppModule {}
