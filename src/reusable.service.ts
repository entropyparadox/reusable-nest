import { Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import { BaseModel } from './base-model.entity';

export interface IReusableService<Entity> {
  readonly repository: Repository<Entity>;
  findById(id: number): Promise<Entity | undefined>;
  findAll(): Promise<Entity[]>;
  findByIds(ids: number[]): Promise<Entity[]>;
  save(data: any): Promise<Entity>;
  updateByIds(ids: number[], data: any): Promise<UpdateResult>;
  delete(id: number): Promise<DeleteResult>;
  deleteByIds(ids: number[]): Promise<DeleteResult>;
}

export function ReusableService<Entity extends BaseModel>(
  entity: Type<Entity>,
): Type<IReusableService<Entity>> {
  class ReusableServiceHost implements IReusableService<Entity> {
    @InjectRepository(entity) readonly repository!: Repository<Entity>;

    findById(id: number) {
      return this.repository.findOne(id);
    }

    findAll() {
      return this.repository.find();
    }

    findByIds(ids: number[]) {
      return this.repository.find({ where: { id: In(ids) } });
    }

    save(data: any) {
      return this.repository.save(data);
    }

    updateByIds(ids: number[], data: any) {
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
