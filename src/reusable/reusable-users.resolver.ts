import { Inject, Type, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AuthResponse,
  AuthService,
  CurrentUser,
  GqlLocalAuthGuard,
  Public,
} from '../auth';
import { BaseModel } from './base-model.entity';
import { IReusableResolver, ReusableResolver } from './reusable.resolver';
import { IReusableService } from './reusable.service';

export interface IReusableUsersResolver<Service, Entity>
  extends IReusableResolver<Service, Entity>,
    IReusableResolver<Service, Entity> {
  readonly authService: AuthService;
}

export function ReusableUsersResolver<
  Service extends IReusableService<Entity>,
  Entity extends BaseModel
>(
  reusableService: Type<Service>,
  entity: Type<Entity>,
): Type<IReusableUsersResolver<Service, Entity>> {
  @Resolver()
  class ReusableUsersResolverHost extends ReusableResolver(
    reusableService,
    entity,
  ) {
    @Inject(AuthService) readonly authService!: AuthService;

    @Public()
    @Mutation(() => AuthResponse)
    @UseGuards(GqlLocalAuthGuard)
    login(
      @CurrentUser() user: Entity,
      @Args('email') email: string,
      @Args('password') password: string,
    ) {
      return this.authService.login(user.id);
    }

    @Public()
    @Mutation(() => AuthResponse)
    loginWithKakao(@Args('accessToken') accessToken: string) {
      return this.authService.loginWithKakao(accessToken);
    }

    @Query(() => entity)
    me(@CurrentUser() user: Entity) {
      return user;
    }
  }
  return ReusableUsersResolverHost;
}
