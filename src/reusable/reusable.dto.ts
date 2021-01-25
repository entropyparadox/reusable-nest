import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';

@ArgsType()
export class CursorArgs {
  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  after?: number;
}

@ObjectType()
export class DeleteResponse {
  @Field(() => Int)
  id!: number;
}

@ObjectType()
export class BatchResponse {
  @Field(() => [Int])
  ids!: number[];
}
