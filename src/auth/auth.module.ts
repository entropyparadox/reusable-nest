import { DynamicModule, Module, Type } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Provider } from '../enums';
import { IReusableService, IReusableUsersService } from '../reusable';
import { IAuthUser } from './auth-user.entity';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { GqlJwtAuthGuard } from './gql-jwt-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { RolesGuard } from './roles.guard';

@Module({})
export class RestAuthModule {
  static register(
    usersModule: Type<any>,
    usersService: Type<IReusableService<IAuthUser<any>>>,
  ): DynamicModule {
    return {
      module: RestAuthModule,
      imports: [
        PassportModule,
        JwtModule.register({ secret: jwtConstants.secret }),
        usersModule,
      ],
      providers: [
        AuthService,
        {
          provide: Provider.USERS_SERVICE,
          useExisting: usersService,
        },
        LocalStrategy,
        JwtStrategy,
        {
          provide: APP_GUARD,
          useFactory: () => new JwtAuthGuard(new Reflector()),
        },
        {
          provide: APP_GUARD,
          useFactory: () => new RolesGuard(new Reflector()),
        },
      ],
      exports: [AuthService],
    };
  }
}

@Module({})
export class AuthModule {
  static register(
    usersModule: Type<any>,
    usersService: Type<IReusableUsersService<IAuthUser<any>>>,
  ): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        PassportModule,
        JwtModule.register({ secret: jwtConstants.secret }),
        usersModule,
      ],
      providers: [
        AuthService,
        {
          provide: Provider.USERS_SERVICE,
          useExisting: usersService,
        },
        LocalStrategy,
        JwtStrategy,
        {
          provide: APP_GUARD,
          useFactory: () => new GqlJwtAuthGuard(new Reflector()),
        },
        {
          provide: APP_GUARD,
          useFactory: () => new RolesGuard(new Reflector()),
        },
      ],
      exports: [AuthService],
    };
  }
}
