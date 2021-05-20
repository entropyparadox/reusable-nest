import { Inject, Injectable } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import appleSignin from 'apple-signin-auth';
import { Provider } from '../enums';
import { IAuthUser } from './auth-user.entity';
import { IReusableUsersService } from '../reusable';
import axios from 'axios';
import { ExceptionCode, ReusableException } from '../exception';

@ObjectType()
export class AuthResponse {
  @Field(() => String, { nullable: true })
  token?: string;

  @Field(() => Int, { nullable: true })
  kakaoId?: number;

  @Field(() => String, { nullable: true })
  appleId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(Provider.USERS_SERVICE)
    private usersService: IReusableUsersService<IAuthUser<any>>,
    private jwtService: JwtService,
  ) {}

  async signup(user: any): Promise<AuthResponse> {
    const { id } = await this.usersService.signup(user);
    return this.login(id);
  }

  async login(userId: number): Promise<AuthResponse> {
    const payload = { sub: userId };
    return { token: this.jwtService.sign(payload) };
  }

  async loginWithKakao(accessToken: string) {
    const { status, data } = await axios({
      url: 'https://kapi.kakao.com/v1/user/access_token_info',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (status !== 200) {
      throw new ReusableException(ExceptionCode.LOGIN_FAILED);
    }
    const user = await this.usersService.findByKakaoId(data.id);
    return user ? this.login(user.id) : { kakaoId: data.id };
  }

  async loginWithApple(identityToken: string) {
    try {
      const { sub } = await appleSignin.verifyIdToken(identityToken);
      const user = await this.usersService.findByAppleId(sub);
      return user ? this.login(user.id) : { appleId: sub };
    } catch (error) {
      throw new ReusableException(ExceptionCode.LOGIN_FAILED);
    }
  }
}
