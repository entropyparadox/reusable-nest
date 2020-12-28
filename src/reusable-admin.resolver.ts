import { Inject, Type } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { camelCase } from 'lodash';
import { plural } from 'pluralize';
import { Public } from './auth';
import { BaseModel } from './base-model.entity';
import { IReusableService } from './reusable.service';

export interface IReusableAdminResolver<Service, Entity> {
  readonly service: Service;
  getOne(id: number): Promise<Entity | undefined>;
  getList(): Promise<Entity[]>;
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

    @Public()
    @Query(() => entity, { name: camelCase(entity.name) })
    getOne(@Args('id') id: number) {
      return this.service.findById(id);
    }

    @Public()
    @Query(() => [entity], {
      name: camelCase(plural(entity.name)),
    })
    getList() {
      return this.service.findAll();
    }
  }
  return ReusableAdminResolverHost;
}
