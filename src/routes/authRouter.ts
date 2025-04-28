import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import authenticationMiddleware from '../middlewares/authenticationMiddleware';

const authRouter = Router();

authRouter
  .post('/login', AuthController.login)
  .get('/verify-token', authenticationMiddleware, AuthController.verifyToken)
  .get('/logout', authenticationMiddleware, AuthController.logout);

export default authRouter;