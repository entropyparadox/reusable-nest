import { HttpException, HttpStatus, Type } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { DeepPartial } from 'typeorm';
import { IAuthUser } from '../auth';
import { ExceptionCode, ReusableException } from '../exception';
import { IReusableService, ReusableService } from './reusable.service';

export interface IReusableUsersService<Entity>
  extends IReusableService<Entity> {
  findByEmail(email: string): Promise<Entity | undefined>;
  findByEmailIncludingPassword(email: string): Promise<Entity | undefined>;
  findByKakaoId(kakaoId: string): Promise<Entity | undefined>;
  signup(user: DeepPartial<Entity>): Promise<Entity>;
  save(user: DeepPartial<Entity>): Promise<Entity>;
}

export function RestReusableUsersService<Entity extends IAuthUser<any>>(
  entity: Type<Entity>,
): Type<IReusableUsersService<Entity>> {
  class RestReusableUsersServiceHost
    extends RestReusableUsersService(entity)
    implements IReusableUsersService<Entity> {
    findByEmail(email: string) {
      return this.repository.findOne({ where: { email } });
    }

    findByEmailIncludingPassword(email: string) {
      return this.repository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', { email })
        .getOne();
    }

    async signup(user: any) {
      if (user.email) {
        const count = await this.repository.count({ email: user.email });
        if (count > 0) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: '이미 가입한 이메일 입니다.',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (!user.password) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: '비밀번호가 너무 짧습니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      user.password = await hash(user.password, 10);

      return this.repository.save(user);
    }
  }
  return RestReusableUsersServiceHost;
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

    findByEmailIncludingPassword(email: string) {
      return this.repository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', { email })
        .getOne();
    }

    findByKakaoId(kakaoId: string) {
      return this.repository.findOne({ where: { kakaoId } });
    }

    async signup(user: any) {
      if (user.email) {
        const count = await this.repository.count({ email: user.email });
        if (count > 0) {
          throw new ReusableException(ExceptionCode.DUPLICATE_EMAIL);
        }
      }

      if (!user.kakaoId) {
        if (!user.password) {
          throw new ReusableException(ExceptionCode.SHORT_PASSWORD);
        }
        user.password = await hash(user.password, 10);
      }

      return super.save(user);
    }

    async save(user: any) {
      if (user.password) {
        user.password = await hash(user.password, 10);
      } else if (user.password !== undefined) {
        delete user.password;
      }
      return super.save(user);
    }
  }
  return ReusableUsersServiceHost;
}
