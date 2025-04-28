import BaseError from './BaseError';

class BadRequestError extends BaseError {
  constructor(
    message = 'One or more provided data are incorrect',
    status = 400,
  ) {
    super(message, status);
  }
}

export default BadRequestError;