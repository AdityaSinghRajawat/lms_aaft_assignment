import { Router } from 'express';
import * as healthController from '../controllers/health.controller';
import { asyncHandler } from '../utils/asyncHandler';

// Mounted before rate limiting and request logging so orchestrator polling stays cheap.
const router = Router();

router.get('/health', healthController.liveness);
router.get('/ready', asyncHandler(healthController.readiness));

export default router;
