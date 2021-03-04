import { Inject, Type } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { camelCase, kebabCase } from 'lodash';
import { plural } from 'pluralize';
import { Roles } from '../auth';
import { BaseRole } from '../auth/auth.enum';
import { BaseModel } from '../reusable/base-model.entity';
import {
  IPaginatedResponse,
  PaginatedResponse,
} from '../reusable/reusable.dto';
import { IReusableService } from '../reusable/reusable.service';
import { File, StorageService } from '../reusable/storage.service';

export interface IReusableAdminResolver<Service, Entity> {
  readonly service: Service;
  readonly storageService: StorageService;
  getOne(id: number): Promise<Entity | undefined>;
  getList(page: number, perPage: number): Promise<IPaginatedResponse<Entity>>;
  getMany(ids: number[]): Promise<Entity[]>;
  getManyReference(
    target: string,
    id: number,
    page: number,
    perPage: number,
  ): Promise<IPaginatedResponse<Entity>>;
  create(data: string): Promise<Entity | undefined>;
  update(id: number, data: string): Promise<Entity | undefined>;
  updateMany(ids: number[], data: string): Promise<number[]>;
  delete(id: number): Promise<number>;
  deleteMany(ids: number[]): Promise<number[]>;
}

export function ReusableAdminResolver<
  Service extends IReusableService<Entity>,
  Entity extends BaseModel
>(
  reusableService: Type<Service>,
  entity: Type<Entity>,
): Type<IReusableAdminResolver<Service, Entity>> {
  const PaginatedEntityResponse = PaginatedResponse(entity);
  type PaginatedEntityResponse = InstanceType<typeof PaginatedEntityResponse>;

  @Resolver()
  class ReusableAdminResolverHost
    implements IReusableAdminResolver<Service, Entity> {
    @Inject(reusableService) readonly service!: Service;
    @Inject(StorageService) readonly storageService!: StorageService;

    @Roles(BaseRole.ADMIN)
    @Query(() => entity, { name: camelCase(entity.name) })
    getOne(@Args('id') id: number) {
      return this.service.findById(id);
    }

    @Roles(BaseRole.ADMIN)
    @Query(() => PaginatedEntityResponse, {
      name: camelCase(plural(entity.name)),
    })
    getList(@Args('page') page: number, @Args('perPage') perPage: number) {
      return this.service.findByPage(page, perPage);
    }

    @Roles(BaseRole.ADMIN)
    @Query(() => [entity], { name: `${camelCase(plural(entity.name))}ByIds` })
    getMany(@Args('ids', { type: () => [Int] }) ids: number[]) {
      return this.service.findByIds(ids);
    }

    @Roles(BaseRole.ADMIN)
    @Query(() => PaginatedEntityResponse, {
      name: `${camelCase(plural(entity.name))}ByTarget`,
    })
    getManyReference(
      @Args('target') target: string,
      @Args('id') id: number,
      @Args('page') page: number,
      @Args('perPage') perPage: number,
    ) {
      return this.service.findByPage(page, perPage, { [target]: id });
    }

    @Roles(BaseRole.ADMIN)
    @Mutation(() => entity, { name: `create${entity.name}` })
    async create(@Args('data') data: string) {
      let id: number;
      const parsedData = JSON.parse(data);
      const filesWithKey = this.convertBase64PropertiesToFile(parsedData);
      if (filesWithKey.length === 0) {
        id = (await this.service.save({ ...parsedData })).id;
      } else {
        const uploadedData = await this.uploadFiles(parsedData, filesWithKey);
        id = (await this.service.save({ ...uploadedData })).id;
      }
      return this.service.findById(id);
    }

    @Roles(BaseRole.ADMIN)
    @Mutation(() => entity, { name: `update${entity.name}` })
    async update(@Args('id') id: number, @Args('data') data: string) {
      const parsedData = JSON.parse(data);
      const filesWithKey = this.convertBase64PropertiesToFile(parsedData);
      if (filesWithKey.length === 0) {
        await this.service.save({ ...parsedData, id });
      } else {
        const prev = await this.service.findById(id);
        const uploadedData = await this.uploadFiles(
          parsedData,
          filesWithKey,
          prev,
        );
        await this.service.save({ ...uploadedData, id });
      }
      return this.service.findById(id);
    }

    @Roles(BaseRole.ADMIN)
    @Mutation(() => [Int], { name: `update${plural(entity.name)}ByIds` })
    async updateMany(
      @Args('ids', { type: () => [Int] }) ids: number[],
      @Args('data') data: string,
    ) {
      await this.service.updateByIds(ids, JSON.parse(data));
      return ids;
    }

    @Roles(BaseRole.ADMIN)
    @Mutation(() => Int, { name: `delete${entity.name}` })
    async delete(@Args('id') id: number) {
      await this.service.delete(id);
      return id;
    }

    @Roles(BaseRole.ADMIN)
    @Mutation(() => [Int], { name: `delete${plural(entity.name)}ByIds` })
    async deleteMany(@Args('ids', { type: () => [Int] }) ids: number[]) {
      await this.service.deleteByIds(ids);
      return ids;
    }

    private convertBase64PropertiesToFile = (data: any) => {
      return Object.keys(data)
        .filter((key) => data[key] && data[key].base64)
        .map((key) => {
          const arr = data[key].base64.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const buf = Buffer.from(arr[1], 'base64');
          return {
            key,
            file: new File(buf, data[key].title, mime, 'base64'),
          };
        });
    };

    private uploadFiles = async (
      data: any,
      filesWithKey: { key: string; file: File }[],
      prev?: any,
    ) => {
      const promises = filesWithKey.map(async ({ key, file }) => {
        const { Key } =
          prev && prev[key]
            ? await this.storageService.replace(prev[key], file)
            : await this.storageService.add(this.s3Path(key), file);
        return { key, Key }; // key for property name and Key for S3 path
      });
      const uploadedKeys = await Promise.all(promises);
      return Object.assign(
        {},
        data,
        ...uploadedKeys.map(({ key, Key }) => ({ [key]: Key })),
      );
    };

    private s3Path = (key: string) => {
      const entityName = kebabCase(plural(entity.name));
      const propertyName = kebabCase(plural(key));
      return `${entityName}/${propertyName}`;
    };
  }
  return ReusableAdminResolverHost;
}
