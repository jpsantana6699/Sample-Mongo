import { NextFunction, Request, Response } from 'express';
import { validatePasswordStrength } from '../utils/userUtils';
import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';
import userService from '../services/UserService';

class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;

      if (!password) throw new BadRequestError('Password is required');

      validatePasswordStrength(password);

      const user = await userService.create(req.body);
      
      res.status(201).json({
        message: 'User created successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = '1',
        pageSize = '10',
        onlyInactive = 'false',
        ...filters
      } = req.query;

      const pageNumber = parseInt(page as string);
      const pageSizeNumber = parseInt(pageSize as string);
      const showOnlyInactive = onlyInactive === 'true';

      const users = await userService.getAll(
        pageNumber,
        pageSizeNumber,
        filters,
        showOnlyInactive
      );

      if (!users.length) throw new NotFoundError('No users found');

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const user = await userService.getById(id);

      if (!user) throw new NotFoundError('User not found');

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      
      if (req.body.password) delete req.body.password;

      await userService.updateById(id, req.body);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const userId = req.params.id;

      if (!currentPassword || !newPassword) {
        throw new BadRequestError('Current password and new password are required');
      }

      validatePasswordStrength(newPassword);

      await userService.updatePassword(userId, currentPassword, newPassword);

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;
      const userId = req.params.id;

      if (!password) throw new BadRequestError('Password is required');

      validatePasswordStrength(password);

      await userService.resetPassword(userId, password);

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const result = await userService.deleteById(id);

      if (!result) throw new NotFoundError('User not found');

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
  
  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const result = await userService.restore(id);

      if (!result) throw new NotFoundError('User not found');

      res.status(200).json({ message: 'User restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();