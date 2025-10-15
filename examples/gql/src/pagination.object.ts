import { Field, InputType } from "@threadws/loom-graphql";

@InputType()
export class PaginationInput {
  @Field(() => Number)
  public limit?: number;

  @Field(() => Number)
  public offset?: number;
}
