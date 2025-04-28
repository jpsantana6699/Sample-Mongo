import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/BadRequestError';
import jwt from 'jsonwebtoken';
import AuthController from '../controllers/AuthController';

const authenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization;

    if (!token) throw new BadRequestError('Access token is required', 401);

    if (AuthController.isTokenInvalid(token)) {
      throw new BadRequestError('Invalid token', 401);
    }

    const [, accessToken] = token.split(' ');

    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string,
    );

    res.locals.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticationMiddleware;