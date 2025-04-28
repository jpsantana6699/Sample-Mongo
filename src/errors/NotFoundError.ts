import BaseError from './BaseError';

class NotFoundError extends BaseError {
  constructor(message = 'The requested resource was not found') {
    super(message, 404);
  }
}

export default NotFoundError;