import { Controller, Get, Headers, Inject, Param } from '@nestjs/common';
import { MetarResolver } from 'src/helpers/metar-resolver/metar-resolver';
import { Sequelize } from 'sequelize';
import { MetarService } from 'src/services/metar/metar.service';
import { AirportService } from 'src/services/airport/airport.service';
import { lastValueFrom, map } from 'rxjs';
import { ParamsResolver } from 'src/helpers/params-resolver/params-resolver';

const atisDatabase: Sequelize = require('atis-database').sequelize;

@Controller('atis/:icaoId')
export class AtisController {

    constructor(private readonly metarService: MetarService, private readonly airportService: AirportService) {}

    @Get('digital')
    async getDigitalAtis(@Param('icaoId') airportIcao: string, @Headers("authorization") authorization: string): Promise<any> {
        const metar = await this.getMetar(airportIcao, authorization);
        const runwayParams = await this.getRunwaysParams(airportIcao);
        runwayParams.forEach((runwayParam: any) => {
            const splittedMetar = MetarResolver.splitMetarOnRunway(metar, runwayParams.magnetic_hdg);
            console.log(runwayParam.runway, splittedMetar, ParamsResolver.resolveParamsBasedOnMetar(runwayParam.param, splittedMetar));
        });
        return metar;
    }

    private async getMetar(airportIcao: string, authorization: string): Promise<string> {
        return lastValueFrom(this.metarService.getMetar(airportIcao, authorization).pipe(map(response => response.data.metar)));
    }

    private async getAirport(airportIcao: string, authorization: string): Promise<string[]> {
        return (await lastValueFrom(this.airportService.getAirportInfo(airportIcao, authorization)));
    }
    
    private async getRunwaysParams(airportIcao: string): Promise<any> {
        return await atisDatabase.models.RunwayParams.findAll({
            where: {
                airport_icao: airportIcao
            }
        });
    }
}
