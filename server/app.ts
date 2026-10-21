import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import projectRoutes from './routes/projectRoutes.ts';
import taskRoutes from './routes/taskRoutes.ts';
import dashboardRoutes from './routes/dashboardRoutes.ts';
import reportRoutes from './routes/reportRoutes.ts';
import notificationRoutes from './routes/notificationRoutes.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { getDBStatus } from './config/db.ts';

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health and System Status Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: getDBStatus(),
      app: 'Smart Platform for Project Management',
      version: '1.0.0',
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Centralized Error Handler (must be registered after routes)
  app.use(errorHandler);

  return app;
};
