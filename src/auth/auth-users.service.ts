import { EmailAndPassword } from '.';
import { AuthUser } from './auth-user.entity';

export interface AuthUsersService {
  create(user: EmailAndPassword): Promise<AuthUser>;

  findById(id: number): Promise<AuthUser>;

  findOne(filter: any): Promise<AuthUser>;
}
