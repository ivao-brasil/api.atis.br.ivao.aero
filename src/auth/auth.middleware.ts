import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AxiosResponse } from 'axios';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: any, res: Response, next: () => void) {
    if (!req.headers['authorization']) {
      res.sendStatus(HttpStatus.UNAUTHORIZED);
      return;
    }

    this.authService
      .validateAccessToken(req.headers['authorization'])
      .subscribe({
        next: (ivaoRes: AxiosResponse) => {
          if (ivaoRes.data.result === 0) {
            res.sendStatus(HttpStatus.FORBIDDEN);
          } else {
            req['isAdmin'] = ivaoRes.data.staff.length > 0;
            next();
          }
        },
        error: () => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR),
      });
  }
}
