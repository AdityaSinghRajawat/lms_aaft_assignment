import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

/**
 * Auth controller — parses requests, delegates to the service,
 * formats responses. No business logic.
 */
export const authController = {
  async adminLogin(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body, Role.ADMIN);
    sendSuccess(res, result, 'Admin logged in successfully');
  },

  async studentLogin(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body, Role.STUDENT);
    sendSuccess(res, result, 'Student logged in successfully');
  },

  async me(req: Request, res: Response): Promise<void> {
    const profile = await authService.getProfile(req.user!.sub);
    sendSuccess(res, profile, 'Profile fetched successfully');
  },
};
