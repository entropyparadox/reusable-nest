import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType({ isAbstract: true })
export class AuthUser {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column('text', { nullable: false })
  @Index({ unique: true })
  email!: string;

  @Field(() => String)
  @Column('text', { nullable: false })
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

  @Field(() => Date)
  @Column('timestamp')
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => Date)
  @Column('timestamp')
  @UpdateDateColumn()
  updatedAt!: Date;
}
