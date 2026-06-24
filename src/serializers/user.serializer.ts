import { User } from '@prisma/client';
import { SafeUser } from '../types/user.types';

function toSafeUser(user: User): SafeUser {
  const { password: _password, ...safe } = user;
  return safe;
}

function toSafeUsers(users: User[]): SafeUser[] {
  return users.map(toSafeUser);
}

export { toSafeUser, toSafeUsers };
