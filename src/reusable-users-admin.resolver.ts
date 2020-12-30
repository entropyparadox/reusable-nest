import { Type, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AuthResponse,
  AuthService,
  CurrentUser,
  GqlLocalAuthGuard,
  Public,
} from './auth';
import { BaseModel } from './base-model.entity';
import {
  IReusableAdminResolver,
  ReusableAdminResolver,
} from './reusable-admin.resolver';
import { IReusableService } from './reusable.service';

export interface IReusableUsersAdminResolver<Service, Entity>
  extends IReusableAdminResolver<Service, Entity> {
  login(user: Entity, email: string, password: string): Promise<AuthResponse>;
  me(user: Entity): Entity;
}

export function ReusableUsersAdminResolver<
  Service extends IReusableService<Entity>,
  Entity extends BaseModel
>(
  reusableService: Type<Service>,
  entity: Type<Entity>,
): Type<IReusableUsersAdminResolver<Service, Entity>> {
  @Resolver()
  class ReusableUsersAdminResolverHost
    extends ReusableAdminResolver(reusableService, entity)
    implements IReusableUsersAdminResolver<Service, Entity> {
    constructor(private readonly authService: AuthService) {
      super();
    }

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
  return ReusableUsersAdminResolverHost;
}
