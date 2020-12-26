import { Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, In, Repository } from 'typeorm';
import { BaseModel } from './base-model.entity';

export interface IReusableService<Entity> {
  readonly repository: Repository<Entity>;
  findById(id: number): Promise<Entity | undefined>;
  findAll(): Promise<Entity[]>;
  findByIds(ids: number[]): Promise<Entity[]>;
  save(data: DeepPartial<Entity>): Promise<Entity>;
  delete(id: number): Promise<DeleteResult>;
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

    save(data: DeepPartial<Entity>) {
      return this.repository.save(data);
    }

    delete(id: number) {
      return this.repository.delete(id);
    }
  }
  return ReusableServiceHost;
}
