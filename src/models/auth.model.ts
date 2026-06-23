import { SafeUser } from './user.model';

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  expiresIn: string;
  user: SafeUser;
}
