import { Router } from 'express';
import userController from '../controllers/UserController';

const userRouter = Router();

userRouter
  .post('/', (req, res, next) => userController.create(req, res, next))
  .post('/:id/restore', (req, res, next) => userController.restore(req, res, next))
  .get('/', (req, res, next) => userController.getAll(req, res, next))
  .get('/:id', (req, res, next) => userController.getById(req, res, next))
  .put('/:id', (req, res, next) => userController.updateById(req, res, next))
  .put('/:id/password', (req, res, next) => userController.updatePassword(req, res, next))
  .put('/:id/reset-password', (req, res, next) => userController.resetPassword(req, res, next))
  .delete('/:id', (req, res, next) => userController.deleteById(req, res, next));

export default userRouter;