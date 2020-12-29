import { Inject, Type } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { camelCase } from 'lodash';
import { plural } from 'pluralize';
import { Roles } from './auth';
import { BaseRole } from './auth/auth.enum';
import { BaseModel } from './base-model.entity';
import { IReusableService } from './reusable.service';

export interface IReusableAdminResolver<Service, Entity> {
  readonly service: Service;
  getOne(id: number): Promise<Entity | undefined>;
  getList(): Promise<Entity[]>;
  getMany(ids: number[]): Promise<Entity[]>;
  // create(args: any): Promise<Entity>;
}

export function ReusableAdminResolver<
  Service extends IReusableService<Entity>,
  Entity extends BaseModel
>(
  reusableService: Type<Service>,
  entity: Type<Entity>,
): Type<IReusableAdminResolver<Service, Entity>> {
  @Resolver()
  class ReusableAdminResolverHost
    implements IReusableAdminResolver<Service, Entity> {
    @Inject(reusableService) readonly service!: Service;

    @Roles(BaseRole.ADMIN)
    @Query(() => entity, { name: camelCase(entity.name) })
    getOne(@Args('id') id: number) {
      return this.service.findById(id);
    }

    @Roles(BaseRole.ADMIN)
    @Query(() => [entity], { name: camelCase(plural(entity.name)) })
    getList() {
      return this.service.findAll();
    }

    @Roles(BaseRole.ADMIN)
    @Query(() => [entity], { name: `${camelCase(plural(entity.name))}ByIds` })
    getMany(@Args('ids', { type: () => [Int] }) ids: number[]) {
      return this.service.findByIds(ids);
    }

    // @Roles(BaseRole.ADMIN)
    // @Mutation(() => entity, { name: `create${entity.name}` })
    // create(@Args() args: Entity) {
    //   return this.service.save(args);
    // }
  }
  return ReusableAdminResolverHost;
}
