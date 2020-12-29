import { Field, ObjectType } from '@nestjs/graphql';
import { Column } from 'typeorm';
import { BaseModel } from '../base-model.entity';
import { BaseRole } from './auth.enum';

@ObjectType({ isAbstract: true })
export class AuthUser extends BaseModel {
  @Field(() => String)
  @Column('text', { unique: true })
  email!: string;

  @Field(() => String)
  @Column('text')
  password!: string;

  @Field(() => String)
  @Column('text', { default: BaseRole.USER })
  role!: string;

  @Field(() => Boolean)
  @Column('boolean', { default: true })
  isActive!: boolean;

  @Field(() => Boolean)
  @Column('boolean', { default: false })
  isAdmin!: boolean;
}
