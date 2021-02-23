import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Provider } from '../enums';
import { IAuthUser } from './auth-user.entity';
import { IReusableUsersService } from '../reusable';
import axios from 'axios';

@ObjectType()
export class AuthResponse {
  @Field(() => String, { nullable: true })
  token?: string;

  @Field(() => Int, { nullable: true })
  kakaoId?: number;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(Provider.USERS_SERVICE)
    private usersService: IReusableUsersService<IAuthUser<any>>,
    private jwtService: JwtService,
  ) {}

  async signup(user: any): Promise<AuthResponse> {
    const { id } = await this.usersService.save(user);
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
      throw Error('Authentication with Kakao failed');
    }
    const user = await this.usersService.findByKakaoId(data.id);
    if (user) {
      return this.login(user.id);
    }
    return { kakaoId: data.id };
  }
}
