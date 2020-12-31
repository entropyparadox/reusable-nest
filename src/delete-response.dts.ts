import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteReponse {
  @Field(() => Int)
  id!: number;
}
