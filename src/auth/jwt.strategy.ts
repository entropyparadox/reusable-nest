import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Provider } from '../enums';
import { IReusableUsersService } from '../reusable';
import { IAuthUser } from './auth-user.entity';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(Provider.USERS_SERVICE)
    private usersService: IReusableUsersService<IAuthUser<any>>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const id = payload.sub;
    return await this.usersService.findById(id);
  }
}
