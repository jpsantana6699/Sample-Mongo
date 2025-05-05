import express, { Express } from 'express';
import authRouter from './authRouter';
import userRouter from './userRouter';
import healthRouter from './healthRouter';
import errorsMiddleware from '../middlewares/errorsMiddleware';
import notFoundMiddleware from '../middlewares/notFoundMiddleware';
import authenticationMiddleware from '../middlewares/authenticationMiddleware';

const routes = (app: Express) => {
  app.use(express.json());

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/auth', authRouter);

  app.use('/api/v1/users', authenticationMiddleware, userRouter);

  app.use(notFoundMiddleware);
  app.use(errorsMiddleware);
};

export default routes;