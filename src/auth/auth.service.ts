import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { Field, ObjectType } from '@nestjs/graphql';
import { Provider } from '../enums';
import { IReusableUsersService } from '../reusable-users.service';
import { AuthUser } from './auth-user.entity';

export interface EmailAndPassword {
  email: string;
  password: string;
  [others: string]: any;
}

@ObjectType()
export class AuthResponse {
  @Field(() => String)
  token!: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(Provider.USERS_SERVICE)
    private usersService: IReusableUsersService<AuthUser>,
    private jwtService: JwtService,
  ) {}

  async signup(user: EmailAndPassword): Promise<AuthResponse> {
    user.password = await hash(user.password, 10);
    const { id } = await this.usersService.save(user);
    return this.login(id);
  }

  async login(userId: number): Promise<AuthResponse> {
    const payload = { sub: userId };
    return { token: this.jwtService.sign(payload) };
  }
}
