import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class AdminNoIndexMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: () => void) {
    res.setHeader('X-Robots-Tag', 'noindex');
    next();
  }
}
