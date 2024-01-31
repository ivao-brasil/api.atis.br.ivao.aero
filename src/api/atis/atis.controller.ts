import { Controller, Get, Headers, Inject, Param } from '@nestjs/common';
import { MetarResolver } from 'src/helpers/metar-resolver/metar-resolver';
import { Sequelize } from 'sequelize';
import { MetarService } from 'src/services/metar/metar.service';
import { AirportService } from 'src/services/airport/airport.service';
import { lastValueFrom, map } from 'rxjs';
import { ParamsResolver } from 'src/helpers/params-resolver/params-resolver';
import { AtisInfo } from 'src/interfaces/atisInfo.interface';

const atisDatabase: Sequelize = require('atis-database').sequelize;

@Controller('atis/:icaoId')
export class AtisController {

    constructor(private readonly metarService: MetarService, private readonly airportService: AirportService) {}

    @Get('digital')
    async getDigitalAtis(@Param('icaoId') airportIcao: string, @Headers("authorization") authorization: string): Promise<any> {
        const metar = await this.getMetar(airportIcao, authorization);
        const runwayParams = await this.getRunwaysParams(airportIcao);

        const atisInfo: AtisInfo = {
            icao: airportIcao,
            metar: metar,
            runways: await this.handleRunway(runwayParams, metar),
            remarks: '',
            digitalAtis: ''
        }
        return atisInfo;
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

    private async getRunwaysProcedures(airportIcao: string): Promise<any> {
        return await atisDatabase.models.procedures.findAll({
            where: {
                airport_icao: airportIcao
            }
        });
    }

    private async handleRunway(runwayParams: any, metar: string) {
        let runways: any = this.handleRunwayWindParams(runwayParams, metar);
        runways = await this.handleRunwayProcedures(runwayParams[0].airport_icao, runways);

        return runways;
    }

    private handleRunwayWindParams(runwayParams: any, metar: string): any {
        const runways:any = {};
        runwayParams.forEach((singleRunwayParams: any) => {
            const splittedMetar = MetarResolver.splitMetarOnRunway(metar, singleRunwayParams.magnetic_hdg, 0);
            if(!(singleRunwayParams.runway in runways)){
                runways[`${singleRunwayParams.runway}`] = {};
            }
            runways[`${singleRunwayParams.runway}`][singleRunwayParams.type] = {
                active: ParamsResolver.resolveParamsBasedOnMetar(singleRunwayParams.param, splittedMetar)
            };
        });
        return runways;
    }

    private async handleRunwayProcedures(airportIcao: string, runways: any) {
        const procedures = await this.getRunwaysProcedures(airportIcao);
        procedures.forEach((procedure: any) => {
            if(runways[procedure.runway] && runways[procedure.runway][procedure.type]){
                if(!runways[procedure.runway][procedure.type].procedures){
                    runways[procedure.runway][procedure.type].procedures = [];
                }
                runways[procedure.runway][procedure.type].procedures.push(procedure.procedure);
            }
        });
        return runways;
    }
}
