import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { compare } from 'bcryptjs';
import { Strategy } from 'passport-local';
import { Provider } from '../enums';
import { ExceptionCode, ReusableException } from '../exception';
import { IReusableUsersService } from '../reusable';
import { IAuthUser } from './auth-user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(Provider.USERS_SERVICE)
    private usersService: IReusableUsersService<IAuthUser<any>>,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailIncludingPassword(email);
    if (user && (await compare(password, user.password))) {
      return user;
    }

    throw new ReusableException(ExceptionCode.LOGIN_FAILED);
  }
}
