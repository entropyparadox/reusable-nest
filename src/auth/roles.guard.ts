import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { IAuthUser } from './auth-user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    // REST
    // const user = context.switchToHttp().getRequest().user as IAuthUser<any>;

    // GraphQL
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user as IAuthUser<any>;

    return roles.includes(user.role);
  }
}
