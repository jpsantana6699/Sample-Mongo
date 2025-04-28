import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/BadRequestError';
import BaseError from '../errors/BaseError';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const errorsMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (error instanceof jwt.JsonWebTokenError) {
    new BadRequestError('Invalid token', 401).sendResponse(res);
  } else if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map(err => err.message).join(' | ');
    new BadRequestError(`Validation error: ${messages}`).sendResponse(res);
  } else if (error instanceof mongoose.Error.CastError) {
    new BadRequestError('Invalid ID format').sendResponse(res);
  } else if (error instanceof BaseError) {
    error.sendResponse(res);
  } else {
    console.error(error);
    new BaseError().sendResponse(res);
  }
};

export default errorsMiddleware;