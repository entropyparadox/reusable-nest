import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { Column } from 'typeorm';
import { BaseModel } from '../reusable';
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
    @Field(() => String, { nullable: true })
    @Column('text', { unique: true, nullable: true })
    email!: string;

    @Field(() => String, { nullable: true })
    @Column('text', { nullable: true, select: false })
    password!: string;

    @Field(() => role)
    @Column({ type: 'enum', enum: role, default: BaseRole.USER })
    role!: R;
  }
  return AuthUserHost;
}
