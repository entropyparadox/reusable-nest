import { Type } from '@nestjs/common';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { BaseModel } from './base-model.entity';

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

export interface IPaginationResponse<Entity> {
  data: Entity[];
  total: number;
}

export function PaginationResponse<Entity extends BaseModel>(
  entity: Type<Entity>,
): Type<IPaginationResponse<Entity>> {
  @ObjectType()
  class PaginationResponseHost {
    @Field(() => [entity])
    data!: Entity[];

    @Field(() => Int)
    total!: number;
  }
  return PaginationResponseHost;
}
