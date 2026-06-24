import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './swagger';
import apiRouter from './routes';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

/**
 * Builds and configures the Express application.
 * Server bootstrap (listen, DB connect) lives in server.ts.
 */
export function createApp(): Application {
  const app = express();

  // Security & parsing middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging (bonus)
  app.use(requestLogger);

  // API documentation (bonus)
  app.use(`${env.apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get(`${env.apiPrefix}/docs.json`, (_req: Request, res: Response) => res.json(swaggerSpec));

  // Mounted API
  app.use(env.apiPrefix, apiRouter);

  // Root
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Mini LMS API',
      data: { docs: `${env.apiPrefix}/docs`, health: `${env.apiPrefix}/health` },
    });
  });

  // 404 + centralised error handling (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
