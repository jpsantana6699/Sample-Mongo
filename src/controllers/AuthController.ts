import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/BadRequestError';
import userService from '../services/UserService';
import jwt from 'jsonwebtoken';

const invalidTokens = new Set<string>();

class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        throw new BadRequestError('Email and password are required', 401);

      const user = await userService.findByEmail(email);

      if (!user) throw new BadRequestError('Invalid email or password', 401);

      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) throw new BadRequestError('Invalid email or password', 401);

      const accessToken = jwt.sign(
        { id: user._id, name: user.name, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: 86400 },
      );
      
      res.status(200).json({ token: accessToken });
    } catch (error) {
      next(error);
    }
  }

  static async verifyToken(_req: Request, res: Response, next: NextFunction) {
    try {
      const { id, name, email } = res.locals.user;
     
      res.status(200).json({ id, name, email });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization!;
      
      invalidTokens.add(token);

      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  static isTokenInvalid(token: string): boolean {
    return invalidTokens.has(token);
  }
}

export default AuthController;