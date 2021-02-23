import { Type } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { DeepPartial } from 'typeorm';
import { IAuthUser } from '../auth';
import { IReusableService, ReusableService } from './reusable.service';

export interface IReusableUsersService<Entity>
  extends IReusableService<Entity> {
  findByEmail(email: string): Promise<Entity | undefined>;
  findByKakaoId(kakaoId: string): Promise<Entity | undefined>;
  save(user: DeepPartial<Entity>): Promise<Entity>;
}

export function ReusableUsersService<Entity extends IAuthUser<any>>(
  entity: Type<Entity>,
): Type<IReusableUsersService<Entity>> {
  class ReusableUsersServiceHost
    extends ReusableService(entity)
    implements IReusableUsersService<Entity> {
    findByEmail(email: string) {
      return this.repository.findOne({ where: { email } });
    }

    findByKakaoId(kakaoId: string) {
      return this.repository.findOne({ where: { kakaoId } });
    }

    async save(user: any) {
      if (user.password) {
        user.password = await hash(user.password, 10);
      }
      return super.save(user);
    }
  }
  return ReusableUsersServiceHost;
}
