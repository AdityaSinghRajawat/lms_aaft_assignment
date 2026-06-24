import { Role, User } from '@prisma/client';

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
  password: string;
  role: Role;
}
