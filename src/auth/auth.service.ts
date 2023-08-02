import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class AuthService {

  constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) {}

  validateAccessToken(token: string): Observable<any> {
    return this.httpService.get(`${this.configService.get<string>('AUTH_SERVER')}/api.php?type=json&token=${token}`);
  }
}
