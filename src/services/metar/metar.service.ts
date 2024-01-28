import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class MetarService {

    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) {}

    getMetar(icao: string, authorization: string): Observable<any> {
        return this.httpService.get(`${this.configService.get<string>('API_SERVER')}/airports/${icao}/metar`, {
            headers: {
                Authorization: authorization
            }
        });
    }
}
