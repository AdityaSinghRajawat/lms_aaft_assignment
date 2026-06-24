import { User } from '@prisma/client';
import { SafeUser } from '../types/user.types';

function toSafeUser(user: User): SafeUser {
  const { password: _password, ...safe } = user;
  return safe;
}

export { toSafeUser };
