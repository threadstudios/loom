import { Field, ObjectType } from "@threadws/loom-graphql";

@ObjectType()
export class User {
  @Field(() => Number)
  public id: string;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public email: string;
}
