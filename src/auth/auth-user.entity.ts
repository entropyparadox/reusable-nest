import { Field, ObjectType } from '@nestjs/graphql';
import { Column } from 'typeorm';
import { BaseModel } from '../base-model.entity';

@ObjectType({ isAbstract: true })
export class AuthUser extends BaseModel {
  @Field(() => String)
  @Column('text', { unique: true })
  email!: string;

  @Field(() => String)
  @Column('text')
  password!: string;

  @Field(() => String)
  @Column('text', { default: 'USER' })
  role!: string;

  @Field(() => Boolean)
  @Column('boolean', { default: true })
  isActive!: boolean;

  @Field(() => Boolean)
  @Column('boolean', { default: false })
  isAdmin!: boolean;
}
