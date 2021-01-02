import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType({ isAbstract: true })
export class BaseModel {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Date)
  @Column('timestamp')
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => Date)
  @Column('timestamp')
  @UpdateDateColumn()
  updatedAt!: Date;
}
