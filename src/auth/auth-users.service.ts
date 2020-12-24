import { EmailAndPassword } from '.';
import { AuthUser } from './auth-user.entity';

export interface AuthUsersService {
  findById(id: number): Promise<AuthUser>;

  findByEmail(email: string): Promise<AuthUser>;

  save(user: EmailAndPassword): Promise<AuthUser>;
}
