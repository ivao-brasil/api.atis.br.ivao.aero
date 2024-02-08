import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MetarService {

    constructor(private readonly httpService: HttpService) {}

    getAllMetar(): Observable<any> {
        return this.httpService.get(`${process.env.IVAO_API ?? 'https://api.ivao.aero/v2'}/airports/all/metar`);
    }
}
