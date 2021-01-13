import { Inject, Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Connection,
  DeepPartial,
  DeleteResult,
  FindConditions,
  FindManyOptions,
  LessThan,
  ObjectLiteral,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseModel } from './base-model.entity';

export interface IReusableService<Entity> {
  readonly connection: Connection;
  readonly repository: Repository<Entity>;
  findById(id: number): Promise<Entity | undefined>;
  findAll(): Promise<Entity[]>;
  findByIds(ids: number[]): Promise<Entity[]>;
  save(data: DeepPartial<Entity>): Promise<Entity>;
  updateByIds(
    ids: number[],
    data: QueryDeepPartialEntity<Entity>,
  ): Promise<UpdateResult>;
  findByCursor(
    first?: number,
    after?: number,
    where?: FindConditions<Entity> | ObjectLiteral,
    relations?: string[],
  ): Promise<Entity[]>;
  delete(id: number): Promise<DeleteResult>;
  deleteByIds(ids: number[]): Promise<DeleteResult>;
}

export function ReusableService<Entity extends BaseModel>(
  entity: Type<Entity>,
): Type<IReusableService<Entity>> {
  class ReusableServiceHost implements IReusableService<Entity> {
    @Inject() readonly connection!: Connection;
    @InjectRepository(entity) readonly repository!: Repository<Entity>;

    findById(id: number) {
      return this.repository.findOne(id);
    }

    findAll() {
      return this.repository.find();
    }

    findByIds(ids: number[]) {
      return this.repository.findByIds(ids);
    }

    findByCursor(
      first = 20,
      after?: number,
      where: FindConditions<Entity> | ObjectLiteral = {},
      relations?: string[],
    ) {
      const options: FindManyOptions<Entity> = {
        relations,
        where,
        order: { id: 'DESC' },
        take: Math.min(first, 100),
      };
      if (after) {
        options.where = { ...where, id: LessThan(after) };
      }
      return this.repository.find(options);
    }

    save(data: DeepPartial<Entity>) {
      return this.repository.save(data);
    }

    updateByIds(ids: number[], data: QueryDeepPartialEntity<Entity>) {
      return this.repository.update(ids, data);
    }

    delete(id: number) {
      return this.repository.delete(id);
    }

    deleteByIds(ids: number[]) {
      return this.repository.delete(ids);
    }
  }
  return ReusableServiceHost;
}
