import { Query, ResolveField, Resolver } from "@threadws/loom-graphql";
import { Todo } from "./todo.object";
import { User } from "./user.object";

@Resolver(() => User)
export class UserResolver {
  @Query(() => User)
  getUser() {
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
