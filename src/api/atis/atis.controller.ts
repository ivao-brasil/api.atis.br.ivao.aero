import { Controller, Get, Headers, Inject, Param, Put } from '@nestjs/common';
import { MetarResolver } from 'src/helpers/metar-resolver/metar-resolver';
import { Sequelize } from 'sequelize';
import { MetarService } from 'src/services/metar/metar.service';
import { lastValueFrom, map } from 'rxjs';
import { ParamsResolver } from 'src/helpers/params-resolver/params-resolver';
import { SplittedMetar } from 'src/interfaces/splittedMetar.interface';

const atisDatabase: Sequelize = require('atis-database').sequelize;

@Controller('atis')
export class AtisController {

    private readonly alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    constructor(private readonly metarService: MetarService) {}

    @Get(':icaoId/digital')
    async getDigitalAtis(@Param('icaoId') airportIcao: string, @Headers("authorization") authorization: string): Promise<any> {
        
    }

    @Put('update')
    async updateAtis(@Headers("authorization") authorization: string){
        const metar:{
            airportIcao: string,
            metar: string,
            updatedAt: Date
        }[] = (await this.getMetar(authorization)).data;

        const allAirportsRunwaysParamsAsList = await this.getRunwaysParams();

        const allAirportsProcedures = await this.getRunwaysProcedures();

        const allAirportsRunwaysParams: any = {};
        let metaridx = 0;
        allAirportsRunwaysParamsAsList.forEach((singleRunwayParams: any) => {
            if(!(singleRunwayParams.airport_icao in allAirportsRunwaysParams)){
                allAirportsRunwaysParams[singleRunwayParams.airport_icao] = {
                    runways: []
                };

                for(; metaridx < metar.length; metaridx++){
                    if(metar[metaridx].airportIcao === singleRunwayParams.airport_icao){
                        allAirportsRunwaysParams[singleRunwayParams.airport_icao].metar = metar[metaridx].metar;
                        break;
                    }
                }
            }

            allAirportsRunwaysParams[singleRunwayParams.airport_icao].runways.push(singleRunwayParams);
        });

        allAirportsProcedures.forEach((procedure: any) => {
            if(!allAirportsRunwaysParams[procedure.airport_icao]['procedures']){
                allAirportsRunwaysParams[procedure.airport_icao]['procedures'] = [];
            }
            allAirportsRunwaysParams[procedure.airport_icao]['procedures'].push(procedure);
        });

        await Object.keys(allAirportsRunwaysParams).forEach(async (airportIcao) => {
            console.log(allAirportsRunwaysParams[airportIcao]);
            if(allAirportsRunwaysParams[airportIcao].metar){
                const airport = await atisDatabase.models.Airport.findOne({
                    where: {
                        airport_icao: airportIcao
                    },
                    include: [
                        {
                            model: atisDatabase.models.Atis,
                            attributes: ['char_id'],
                            on: { current_atis: Sequelize.col('Ati.general_id') },
                            required: false
                        }
                    ]
                });
                const splittedMetar:SplittedMetar = MetarResolver.splitMetar(allAirportsRunwaysParams[airportIcao].metar);
                const runwaysList = await this.handleRunway(allAirportsRunwaysParams[airportIcao].runways, splittedMetar, airport?.dataValues.mag_variation);

                const charId = airport!.dataValues.char_id ? this.incrementChar(airport!.dataValues.char_id) : airportIcao[3];
                const addedAtis = {
                    airport_icao: airportIcao,
                    char_id: charId,
                    runways: runwaysList,
                    digital_atis: this.buildDigitalAtis(airportIcao, splittedMetar, charId, runwaysList, airport?.dataValues.remarks),
                    metar: allAirportsRunwaysParams[airportIcao].metar
                };
                console.log(`Added ATIS for ${airportIcao} with char_id ${charId}`);
                
                await atisDatabase.models.Atis.create(addedAtis);
                await atisDatabase.query(`UPDATE airports SET current_atis = LAST_INSERT_ID() WHERE airport_icao = '${airportIcao}'`);
            }
        });
    }

    private async getMetar(authorization: string): Promise<any> {
        return lastValueFrom(this.metarService.getAllMetar(authorization));
    }
    
    private async getRunwaysParams(): Promise<any> {
        return await atisDatabase.models.RunwayParams.findAll();
    }

    private async getRunwaysProcedures(): Promise<any> {
        return await atisDatabase.models.Procedures.findAll();
    }

    private async handleRunway(runwayParams: any, splittedMetar: any, magVariation: number) {
        let runways: any = this.handleRunwayWindParams(runwayParams, splittedMetar, magVariation);
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
        const procedures = await this.getRunwaysProcedures();
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
        console.log(splittedMetar);
        return `${airportIcao.toUpperCase()} ATIS ${charId} ${splittedMetar.timestamp} EXPECT ${landingRunways.join(' / ')} DEPARTURE ${takeoffRunways.join(' / ')} WIND ${splittedMetar.wind} ${splittedMetar.pressure} HPA ${airportRemarks ?? ''} END OF ATIS ${charId}`;
    }
}
