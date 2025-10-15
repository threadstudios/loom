import { Args, Parent, ResolveField, Resolver } from "@loom/graphql";
import { Todo } from "./todo.object";
import { User } from "./user.object";

@Resolver(() => Todo)
export class TodoResolver {
  @ResolveField(() => User)
  user(
    @Args({ name: "limit", type: () => Number, nullable: true }) limit?: number,
    @Parent() todo?: Todo
  ) {
    return { id: "1", email: "user@example.com" };
  }
}
