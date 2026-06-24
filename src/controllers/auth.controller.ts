import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/response';

async function adminLogin(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body, Role.ADMIN);
  sendSuccess(res, result, 'Admin logged in successfully');
}

async function studentLogin(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body, Role.STUDENT);
  sendSuccess(res, result, 'Student logged in successfully');
}

async function me(req: Request, res: Response): Promise<void> {
  const profile = await authService.getProfile(req.user!.sub);
  sendSuccess(res, profile, 'Profile fetched successfully');
}

export { adminLogin, studentLogin, me };
