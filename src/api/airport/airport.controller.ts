import { Body, Controller, Get, Headers, Param, Patch, Post, Put } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Sequelize, Op } from 'sequelize';
import { AirportService } from 'src/services/airport/airport.service';

const atisDatabase: Sequelize = require('atis-database').sequelize;

@Controller('airport')
export class AirportController {

    constructor(private readonly airportService: AirportService) {}

    @Get(':airport_icao')
    async getParamsFromAirport(@Param('airport_icao') airport: string): Promise<any>{
        return await atisDatabase.models.Airport.findByPk(airport);
    }

    @Post(':airport_icao')
    createParams(@Param('airport_icao') airport: string): void{
        atisDatabase.models.Airport.create({
            airport_icao: airport,
            current_atis: airport[3],
        });
    }

    @Put()
    async updateAirportList(@Headers("authorization") authorization: string) {
        const airports = (await this.getAirportsFromIvao(authorization)).data;
        await atisDatabase.models.Airport.bulkCreate(airports.map((airport: any) => ({
            airport_icao: airport.icao,
            current_atis: null,
            mag_variation: airport.magnetic
        })));
    }

    private async getAirportsFromIvao(authorization: string): Promise<any> {
        return (await lastValueFrom(this.airportService.getAllAirportsInfo(authorization)));
    }

    @Patch(':airport_icao/remarks')
    updateParams(@Param('airport_icao') airport: string, @Body() remark: any): void{
        atisDatabase.models.Airport.update({
            remarks: remark.remark,
        }, {
            where: {
                airport_icao: airport,
            }
        });
    }

    
}
