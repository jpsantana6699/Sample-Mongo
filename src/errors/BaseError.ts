import { Response } from 'express';

class BaseError extends Error {
  status: number;

  constructor(message = 'Internal Server Error', status = 500) {
    super();
    this.message = message;
    this.status = status;
  }

  sendResponse(res: Response) {
    res.status(this.status).send({
      error: {
        status: this.status,
        message: this.message,
      },
    });
  }
}

export default BaseError;