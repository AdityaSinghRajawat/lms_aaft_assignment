import { Role, User } from '@prisma/client';

/** User entity with the password hash stripped — safe to return over the API. */
export type SafeUser = Omit<User, 'password'>;

export interface CreateStudentInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateStudentInput {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string; // already hashed
  role: Role;
}

/** Strip the password hash from a User record. */
export function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = user;
  return safe;
}
