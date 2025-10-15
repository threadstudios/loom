import {
  Args,
  Ctx,
  Guard,
  Parent,
  Query,
  Schema,
} from "@threadws/loom-graphql";
import { AuthGuard } from "./auth.guard";
import { Todo } from "./todo.object";
import { PaginationInput } from "./pagination.object";

@Guard([AuthGuard])
@Schema()
export class TodoSchema {
  @Query(() => [Todo])
  todos(
    @Args({ name: "input", type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
    @Ctx() ctx?: any,
    @Parent() parent?: any
  ) {
    return [
      { id: "1", title: "First Todo", completed: false },
      { id: "2", title: "Second Todo", completed: true },
    ];
  }
}
