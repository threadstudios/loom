import { Field, ID, ObjectType } from "@loom/graphql";

@ObjectType()
export class Todo {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public todo: string;
}
