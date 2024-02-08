import { Controller, Get, Logger, Param, Put, Res } from '@nestjs/common';
import { MetarResolver } from 'src/helpers/metar-resolver/metar-resolver';
import { Sequelize } from 'sequelize';
import { MetarService } from 'src/services/metar/metar.service';
import { lastValueFrom } from 'rxjs';
import { ParamsResolver } from 'src/helpers/params-resolver/params-resolver';
import { SplittedMetar } from 'src/interfaces/splitted-metar.interface';
import { Response } from 'express';
import { PartiallySplittedMetar } from 'src/interfaces/partially-splitted-metar.interface';

const atisDatabase: Sequelize = require('atis-database').sequelize;

@Controller('atis')
export class AtisController {

    private readonly alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    private readonly logger = new Logger(AtisController.name);

    private readonly units: {ICAO: any, FAA: any} = {
        ICAO: {
            length: 'M',
            speed: 'KT',
            pressure: 'HPA'
        },
        FAA: {
            length: 'FT',
            speed: 'KTS',
            pressure: 'IN-HG'
        }
    }

    constructor(private readonly metarService: MetarService) {}

    @Get(':icaoId/digital')
    async getDigitalAtis(@Param('icaoId') airportIcao: string, @Res() response: Response) {
        if(airportIcao.length !== 4 || !airportIcao.match(/^[A-Z0-9]{4}$/)){
            response.status(400).send('Invalid ICAO code');
            return;
        }
        const atis = await atisDatabase.models.Atis.findOne({
            where: {
                airport_icao: airportIcao
            },
            attributes: ['digital_atis', 'metar', 'char_id', 'runways', 'airport_icao'],
            include: [
                {
                    model: atisDatabase.models.Airport,
                    attributes: [],
                    on: { general_id: Sequelize.literal('`Atis`.`general_id` = `Airport`.`current_atis`') },
                    required: true
                }
            ]
        });
        if(!atis){
            response.status(404).send('ATIS not found');
            return;
        }
        response.status(200).send(atis);
        return atis;
    }

    @Put('update')
    async updateAtis(@Res() response: Response){
        try{
            this.logger.log('Updating ATIS');
            const metar:{
                airportIcao: string,
                metar: string,
                updatedAt: Date
            }[] = (await this.getMetar()).data;
            this.logger.log(`Got ${metar.length} METARs`);
    
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
                if(allAirportsRunwaysParams[airportIcao].metar){
                    const airport = await atisDatabase.models.Airport.findOne({
                        where: {
                            airport_icao: airportIcao
                        },
                        include: [
                            {
                                as: 'Atis',
                                model: atisDatabase.models.Atis,
                                attributes: ['char_id'],
                                on: { general_id: Sequelize.literal('`Atis`.`general_id` = `Airport`.`current_atis`') },
                                required: false
                            }
                        ]
                    });
                    const partialSplittedMetar:PartiallySplittedMetar = MetarResolver.splitMetar(allAirportsRunwaysParams[airportIcao].metar, 'ICAO');
                    const splittedMetar = MetarResolver.processSplittedMetar(partialSplittedMetar, 0, airport?.dataValues.mag_variation, 'ICAO');
                    const runwaysList = await this.handleRunway(allAirportsRunwaysParams[airportIcao].runways, splittedMetar, airport?.dataValues.mag_variation);
                    const charId = airport!.dataValues.Atis?.dataValues.char_id ? this.incrementChar(airport!.dataValues.Atis.dataValues.char_id) : airportIcao[3];
                    const addedAtis = {
                        airport_icao: airportIcao,
                        char_id: charId,
                        runways: runwaysList,
                        digital_atis: this.buildDigitalAtis(airportIcao, splittedMetar, charId, runwaysList, airport?.dataValues.remarks, 'ICAO'),
                        metar: allAirportsRunwaysParams[airportIcao].metar
                    };
                    
                    await atisDatabase.models.Atis.create(addedAtis);
                    this.logger.log(`Added ATIS for ${airportIcao} with char_id ${charId}`);
                }
            });
        }
        catch(e){
            this.logger.error(e);
            response.status(500).send(e);
            return;
        }
        response.status(204).send();
    }

    private async getMetar(): Promise<any> {
        return lastValueFrom(this.metarService.getAllMetar());
    }
    
    private async getRunwaysParams(): Promise<any> {
        return await atisDatabase.models.RunwayParams.findAll();
    }

    private async getRunwaysProcedures(): Promise<any> {
        return await atisDatabase.models.Procedures.findAll();
    }

    private async handleRunway(runwayParams: any, splittedMetar: SplittedMetar, magVariation: number) {
        let runways: any = this.handleRunwayWindParams(runwayParams, splittedMetar, magVariation);
        runways = await this.handleRunwayProcedures(runwayParams[0].airport_icao, runways);

        return runways;
    }

    private handleRunwayWindParams(runwayParams: any, splittedMetar: SplittedMetar, magVariation: number): any {
        const runways:any = {};
        runwayParams.forEach((singleRunwayParams: any) => {
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

    private incrementChar(c: string) {
        var index = this.alphabet.indexOf(c);
        return this.alphabet[index + 1 % this.alphabet.length]
    }
    
    private buildDigitalAtis(airportIcao: string, splittedMetar: SplittedMetar, charId: string, runwaysList: any, airportRemarks: any, type: 'ICAO' | 'FAA'): string {
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
        let windCompose = '';
        if(splittedMetar.wind){
            if(splittedMetar.wind!.trueWindDirection === 'VRB'){
                windCompose = `VARIABLE AT ${splittedMetar.wind!.nominalWindSpeed} KT`;
            }
            else {
                windCompose = `${splittedMetar.wind!.magWindDirection} AT ${splittedMetar.wind!.nominalWindSpeed} KT`;
                if(splittedMetar.wind!.gustSpeed! > 0) {
                    windCompose = `${windCompose} GUSTING AT ${splittedMetar.wind!.gustSpeed} KT`;
                }
                if(splittedMetar.wind!.variationStart && splittedMetar.wind!.variationEnd){
                    windCompose = `${windCompose} VARIABLE BETWEEN ${splittedMetar.wind!.variationStart} AND ${splittedMetar.wind!.variationEnd}`;
                }
            }
        }
        
        let visiblitityCompose = '';
        if(splittedMetar.visibility){
            if(splittedMetar.visibility!.isCavok){
                visiblitityCompose = 'CAVOK ';
            }
            else {
                visiblitityCompose = `${splittedMetar.visibility!.horizontalVisibility!.general} ${this.units[type].length} `;
                if(splittedMetar.visibility!.horizontalVisibility!.directional.length > 0){
                    visiblitityCompose += splittedMetar.visibility!.horizontalVisibility!.directional.map((direction: any) => `${direction.direction} ${direction.visibility} ${this.units[type].length} `).join(' ');
                }
            }
        }
        visiblitityCompose += splittedMetar.visibility!.cloudLayers.map((cloudLayer: any) => `${cloudLayer.type} ${cloudLayer.height} ${this.units[type].length} `).join(' ');
        return `${airportIcao.toUpperCase()} AUTOMATIC ATIS ${charId} ${splittedMetar.time!.getUTCHours().toString().padStart(2, '0')}${splittedMetar.time!.getUTCMinutes().toString().padStart(2, '0')}Z EXPECT ARRIVAL ${landingRunways.join(' / ')} DEPARTURE ${takeoffRunways.join(' / ')} WIND ${windCompose} VIS ${visiblitityCompose}${splittedMetar.altimeter} ${this.units[type].pressure} ${airportRemarks ?? ''} END OF ATIS ${charId}`;
    }
}
