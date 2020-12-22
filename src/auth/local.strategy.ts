import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { compare } from 'bcryptjs';
import { Strategy } from 'passport-local';
import { Provider } from '../enums';
import { AuthUsersService } from './auth-users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(Provider.USERS_SERVICE) private usersService: AuthUsersService,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await compare(password, user.password))) {
      return user;
    }

    throw new UnauthorizedException();
  }
}
