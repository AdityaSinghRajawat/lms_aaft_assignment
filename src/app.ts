import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { env, isProduction } from './config/env';
import { APP } from './constants/app.constants';
import { swaggerSpec } from './swagger';
import apiRouter from './routes';
import healthRouter from './routes/health.routes';
import { apiRateLimiter } from './middlewares/rateLimit.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

export function createApp(): Application {
  const app = express();

  // Trust the proxy's X-Forwarded-* so client IP (rate limiting) and protocol
  // are accurate behind a load balancer. Production only, where a proxy exists.
  if (isProduction) {
    app.set('trust proxy', 1);
  }
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors());
  app.use(compression());

  // Probes before rate limiting and logging so orchestrator polling stays cheap.
  app.use(healthRouter);

  app.use(express.json({ limit: APP.JSON_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.use(`${env.apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get(`${env.apiPrefix}/docs.json`, (_req: Request, res: Response) => res.json(swaggerSpec));

  app.use(env.apiPrefix, apiRateLimiter, apiRouter);

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Mini LMS API',
      data: { docs: `${env.apiPrefix}/docs`, health: '/health', ready: '/ready' },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
