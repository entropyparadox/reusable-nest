import { Inject, Type, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AuthResponse,
  AuthService,
  CurrentUser,
  GqlLocalAuthGuard,
  Public,
} from '../auth';
import { BaseModel } from '../reusable/base-model.entity';
import { IReusableService } from '../reusable/reusable.service';
import {
  IReusableAdminResolver,
  ReusableAdminResolver,
} from './reusable-admin.resolver';

export interface IReusableAdminUsersResolver<Service, Entity>
  extends IReusableAdminResolver<Service, Entity> {
  login(user: Entity, email: string, password: string): Promise<AuthResponse>;
  me(user: Entity): Entity;
}

export function ReusableAdminUsersResolver<
  Service extends IReusableService<Entity>,
  Entity extends BaseModel
>(
  reusableService: Type<Service>,
  entity: Type<Entity>,
): Type<IReusableAdminUsersResolver<Service, Entity>> {
  @Resolver()
  class ReusableAdminUsersResolverHost
    extends ReusableAdminResolver(reusableService, entity)
    implements IReusableAdminUsersResolver<Service, Entity> {
    @Inject(AuthService) readonly authService!: AuthService;

    @Public()
    @UseGuards(GqlLocalAuthGuard)
    @Mutation(() => AuthResponse)
    login(
      @CurrentUser() user: Entity,
      @Args('email') email: string,
      @Args('password') password: string,
    ) {
      return this.authService.login(user.id);
    }

    @Query(() => entity)
    me(@CurrentUser() user: Entity) {
      return user;
    }
  }
  return ReusableAdminUsersResolverHost;
}
