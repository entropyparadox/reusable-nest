import { Type } from '@nestjs/common';
import { AuthUser } from './auth';
import { IReusableService, ReusableService } from './reusable.service';

export interface IReusableUsersService<Entity>
  extends IReusableService<Entity> {
  findByEmail(email: string): Promise<Entity | undefined>;
}

export function ReusableUsersService<Entity extends AuthUser>(
  entity: Type<Entity>,
): Type<IReusableUsersService<Entity>> {
  class ReusableUsersServiceHost
    extends ReusableService(entity)
    implements IReusableUsersService<Entity> {
    findByEmail(email: string) {
      return this.repository.findOne({ where: { email } });
    }
  }
  return ReusableUsersServiceHost;
}
