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
  // getManyReference
  // create(input: any): Promise<Entity>;
  // update
  // updateMany
  delete(id: number): Promise<Entity>;
  deleteMany(ids: number[]): Promise<number[]>;
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

    // getManyReference

    // @Roles(BaseRole.ADMIN)
    // @Mutation(() => entity, { name: `create${entity.name}` })
    // create(@Args('input') input: CreateInput) {
    //   return this.service.save(input);
    // }

    // update

    // updateMany

    @Roles(BaseRole.ADMIN)
    @Mutation(() => entity, { name: `delete${entity.name}` })
    async delete(@Args('id') id: number) {
      await this.service.delete(id);
      return { id } as Entity;
    }

    @Roles(BaseRole.ADMIN)
    @Mutation(() => [Int], { name: `delete${plural(entity.name)}ByIds` })
    async deleteMany(@Args('ids', { type: () => [Int] }) ids: number[]) {
      await this.service.deleteByIds(ids);
      return ids;
    }
  }
  return ReusableAdminResolverHost;
}
