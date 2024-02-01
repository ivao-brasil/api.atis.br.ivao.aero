import { Controller, Get, Headers, Inject, Param } from '@nestjs/common';
import { MetarResolver } from 'src/helpers/metar-resolver/metar-resolver';
import { Sequelize } from 'sequelize';
import { MetarService } from 'src/services/metar/metar.service';
import { AirportService } from 'src/services/airport/airport.service';
import { lastValueFrom, map } from 'rxjs';
import { ParamsResolver } from 'src/helpers/params-resolver/params-resolver';
import { AtisInfo } from 'src/interfaces/atisInfo.interface';
import { SplittedMetar } from 'src/interfaces/splittedMetar.interface';

const atisDatabase: Sequelize = require('atis-database').sequelize;

@Controller('atis/:icaoId')
export class AtisController {

    private readonly alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    constructor(private readonly metarService: MetarService, private readonly airportService: AirportService) {}

    @Get('digital')
    async getDigitalAtis(@Param('icaoId') airportIcao: string, @Headers("authorization") authorization: string): Promise<any> {
        let atisInfo: any | undefined = await this.getValidAtis(airportIcao);
        let charId = airportIcao[3].toLocaleUpperCase();

        console.log(atisInfo);
        if(atisInfo){
            charId = this.incrementChar(atisInfo.char_id);
        }

        const metar = await this.getMetar(airportIcao, authorization);
        const splittedMetar:SplittedMetar = MetarResolver.splitMetar(metar);
        const runwayParams = await this.getRunwaysParams(airportIcao);
        const runwaysList = await this.handleRunway(runwayParams, splittedMetar, authorization);
        const airportRemarks = await this.getAirportInfo(airportIcao);
        const digitalAtis = this.buildDigitalAtis(airportIcao, splittedMetar, charId, runwaysList, airportRemarks);

        atisInfo = {
            icao: airportIcao,
            metar: metar,
            char_id: charId,
            runways: runwaysList,
            remarks: airportRemarks,
            digitalAtis: digitalAtis
        }
        return atisInfo;
    }

    private async getMetar(airportIcao: string, authorization: string): Promise<string> {
        return lastValueFrom(this.metarService.getMetar(airportIcao, authorization).pipe(map(response => response.data.metar)));
    }

    private async getAirportInfoFromIvao(airportIcao: string, authorization: string): Promise<any> {
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
        return await atisDatabase.models.Procedures.findAll({
            where: {
                airport_icao: airportIcao
            }
        });
    }

    private async handleRunway(runwayParams: any, splittedMetar: any, authorization: string) {
        const airportInfo = await this.getAirportInfoFromIvao(runwayParams[0].airport_icao, authorization);
        let runways: any = this.handleRunwayWindParams(runwayParams, splittedMetar, airportInfo.magnetic);
        runways = await this.handleRunwayProcedures(runwayParams[0].airport_icao, runways);

        return runways;
    }

    private handleRunwayWindParams(runwayParams: any, splittedMetar: any, magVariation: number): any {
        const runways:any = {};
        runwayParams.forEach((singleRunwayParams: any) => {
            const splittedMetarOnRunway = MetarResolver.splitMetarOnRunway(splittedMetar, singleRunwayParams.magnetic_hdg, magVariation);
            if(!(singleRunwayParams.runway in runways)){
                runways[`${singleRunwayParams.runway}`] = {};
            }
            runways[`${singleRunwayParams.runway}`][singleRunwayParams.type] = {
                active: ParamsResolver.resolveParamsBasedOnMetar(singleRunwayParams.param, splittedMetarOnRunway)
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

    private async getAirportInfo(airport: string): Promise<any> {
        return await atisDatabase.models.Airport.findByPk(airport);
    }

    private async getValidAtis(airport: string): Promise<any | undefined> {
        return await atisDatabase.models.Atis.findOne({
            attributes: ['char_id', 'runways', 'digital_atis', 'metar'],
            where: {
                airport_icao: airport
            },
            include: [
                {
                    model: atisDatabase.models.Airport,
                    attributes: ['remarks'],
                    where: { general_id: Sequelize.col('airport.current_atis') },
                    required: true
                }
            ]
        });
    }

    private incrementChar(c: string) {
        var index = this.alphabet.indexOf(c);
        return this.alphabet[index + 1 % this.alphabet.length]
    }
//SBGR ARR ATIS A 2249Z ATIS A EXP ILS Y RWY 28L APP/ LDG 28L DEP 28R IN USE TWY B CLSD BTN TWY P AND TWY Q CLR DELIVERY 1 2 1 DECIMAL 0 TOWER 1 3 5 DECIMAL 2 ACDM OPERATION IN PROGRESS WIND 300 09 KT VIS 10 KM OR MORE LGT RA FEW 2000 FT T 18 / DP 17 QNH 1020 HPA SEGREGATED OPERATION IN PROGRESS END OF ATIS A
    private buildDigitalAtis(airportIcao: string, splittedMetar: any, charId: string, runwaysList: any, airportRemarks: any): string {
        const landingRunways: any[] = [];
        const takeoffRunways: any[] = [];
        for (const runway in runwaysList) {
            if (runwaysList[runway].LANDING && runwaysList[runway].LANDING.active && runwaysList[runway].LANDING.procedures) {
                landingRunways.push(`${runwaysList[runway].LANDING.procedures?.join(' ') || ''} RWY ${runway}`);
            }
            if (runwaysList[runway].TAKEOFF && runwaysList[runway].TAKEOFF.active) {
                takeoffRunways.push(`${runwaysList[runway].TAKEOFF.procedures?.join(' ') || ''} RWY ${runway}`);
            }
        }
        return `${airportIcao.toUpperCase()} ATIS ${charId} ${splittedMetar.timestamp} EXPECT ${landingRunways.join(' / ')} DEPARTURE ${takeoffRunways.join(' / ')} WIND ${splittedMetar.wind} ${splittedMetar.pressure} HPA ${airportRemarks ?? ''} END OF ATIS ${charId}`;
    }
}
