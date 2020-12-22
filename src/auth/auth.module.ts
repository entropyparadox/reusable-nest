import { DynamicModule, Module, Type } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Provider } from '../enums';
import { AuthUsersService } from './auth-users.service';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { GqlJwtAuthGuard } from './gql-jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { RolesGuard } from './roles.guard';

@Module({})
export class AuthModule {
  static register(
    usersModule: Type<any>,
    usersService: Type<AuthUsersService>,
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
