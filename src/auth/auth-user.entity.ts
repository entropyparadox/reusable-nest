import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { Column } from 'typeorm';
import { BaseModel } from '../base-model.entity';
import { BaseRole } from './auth.enum';

export interface IAuthUser<R> extends BaseModel {
  email: string;
  password: string;
  role: R;
}

export function AuthUser<R extends string>(
  role: { [key in R]: string },
): Type<IAuthUser<R>> {
  @ObjectType({ isAbstract: true })
  class AuthUserHost extends BaseModel implements IAuthUser<R> {
    @Field(() => String)
    @Column('text', { unique: true })
    email!: string;

    @Field(() => String)
    @Column('text')
    password!: string;

    @Field(() => role)
    @Column('text', { default: BaseRole.USER })
    role!: R;
  }
  return AuthUserHost;
}
