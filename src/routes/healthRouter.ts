import { Request, Response, Router } from 'express';

const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

export default healthRouter;