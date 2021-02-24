import { Inject, Type } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { camelCase } from 'lodash';
import { plural } from 'pluralize';
import { Roles } from '../auth';
import { BaseRole } from '../auth/auth.enum';
import { BaseModel } from '../reusable/base-model.entity';
import {
  IPaginatedResponse,
  PaginatedResponse,
} from '../reusable/reusable.dto';
import { IReusableService } from '../reusable/reusable.service';

export interface IReusableAdminResolver<Service, Entity> {
  readonly service: Service;
  getOne(id: number): Promise<Entity | undefined>;
  getList(page: number, perPage: number): Promise<IPaginatedResponse<Entity>>;
  getMany(ids: number[]): Promise<Entity[]>;
  getManyReference(
    target: string,
    id: number,
    page: number,
    perPage: number,
  ): Promise<IPaginatedResponse<Entity>>;
  create(data: string): Promise<Entity>;
  update(id: number, data: string): Promise<Entity | undefined>;
  updateMany(ids: number[], data: string): Promise<number[]>;
  delete(id: number): Promise<number>;
  deleteMany(ids: number[]): Promise<number[]>;
}

export function ReusableAdminResolver<
  Service extends IReusableService<Entity>,
  Entity extends BaseModel
>(
  reusableService: Type<Service>,
  entity: Type<Entity>,
): Type<IReusableAdminResolver<Service, Entity>> {
  const PaginatedEntityResponse = PaginatedResponse(entity);
  type PaginatedEntityResponse = InstanceType<typeof PaginatedEntityResponse>;

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
    @Query(() => PaginatedEntityResponse, {
      name: camelCase(plural(entity.name)),
    })
    getList(@Args('page') page: number, @Args('perPage') perPage: number) {
      return this.service.findByPage(page, perPage);
    }

    @Roles(BaseRole.ADMIN)
    @Query(() => [entity], { name: `${camelCase(plural(entity.name))}ByIds` })
    getMany(@Args('ids', { type: () => [Int] }) ids: number[]) {
      return this.service.findByIds(ids);
    }

    @Roles(BaseRole.ADMIN)
    @Query(() => PaginatedEntityResponse, {
      name: `${camelCase(plural(entity.name))}ByTarget`,
    })
    getManyReference(
      @Args('target') target: string,
      @Args('id') id: number,
      @Args('page') page: number,
      @Args('perPage') perPage: number,
    ) {
      return this.service.findByPage(page, perPage, { [target]: id });
    }

    @Roles(BaseRole.ADMIN)
    @Mutation(() => entity, { name: `create${entity.name}` })
    create(@Args('data') data: string) {
      return this.service.save(JSON.parse(data));
    }

    @Roles(BaseRole.ADMIN)
    @Mutation(() => entity, { name: `update${entity.name}` })
    async update(@Args('id') id: number, @Args('data') data: string) {
      await this.service.save({ ...JSON.parse(data), id });
      return this.service.findById(id);
    }

    @Roles(BaseRole.ADMIN)
    @Mutation(() => [Int], { name: `update${plural(entity.name)}ByIds` })
    async updateMany(
      @Args('ids', { type: () => [Int] }) ids: number[],
      @Args('data') data: string,
    ) {
      await this.service.updateByIds(ids, JSON.parse(data));
      return ids;
    }

    @Roles(BaseRole.ADMIN)
    @Mutation(() => Int, { name: `delete${entity.name}` })
    async delete(@Args('id') id: number) {
      await this.service.delete(id);
      return id;
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
