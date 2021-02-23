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

export interface IPaginatedResponse<Entity> {
  data: Entity[];
  total: number;
}

export function PaginatedResponse<Entity extends BaseModel>(
  entity: Type<Entity>,
): Type<IPaginatedResponse<Entity>> {
  @ObjectType(`Paginated${entity.name}Response`)
  class PaginatedResponseHost {
    @Field(() => [entity])
    data!: Entity[];

    @Field(() => Int)
    total!: number;
  }
  return PaginatedResponseHost;
}
