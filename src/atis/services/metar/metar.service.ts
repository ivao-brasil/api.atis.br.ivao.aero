import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MetarResponse } from 'src/atis/interfaces/metar-response.interface';
import { ApiJson } from 'src/interfaces/api-json.interface';

@Injectable()
export class MetarService {

  constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) {}

  getAerodromeMetar(icaoId: string, auth: string): Promise<ApiJson<MetarResponse>> {
    return firstValueFrom(this.httpService.get(`${this.configService.get<string>('IVAO_API_SERVER')}/v2/airports/${icaoId}/metar`,{
      headers: {
        Authorization: auth
      }
    }));
  }
}
