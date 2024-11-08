import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/auth/auth.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const requestIp = require('request-ip');

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // const ip = requestIp.getClientIp(req);

      // const csrf: any = req.headers['x-csrf-token']
      // const r = this.authService.checkCsrfToken(csrf)
      // if (!r) {
      //     return
      // }
      next();
    } catch (e) {}
  }
}
