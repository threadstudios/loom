import { Ctx, Query, ResolveField, Resolver } from "@threadws/loom-graphql";
import { AppService } from "./app.service";
import { Todo } from "./todo.object";
import { User } from "./user.object";

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => User)
  getUser(@Ctx() ctx: { userId: string }) {
    console.log(this.appService.getHello());
    return { id: "1", email: "paul@westerdale.me" };
  }

  @ResolveField(() => [Todo])
  todos(user: User) {
    console.log("User in todos resolver:", user);
    return [
      { id: "1", todo: "Learn GraphQL" },
      { id: "2", todo: "Build a GraphQL API" },
    ];
  }
}
