import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class AirportService {

    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) {}

    getAirportInfo(icao: string, authorization: string): Observable<any> {
        return this.httpService.get(`${this.configService.get<string>('API_SERVER')}/v2/airports/${icao}`, {
            headers: {
                Authorization: authorization
            }
        });
    }
}
