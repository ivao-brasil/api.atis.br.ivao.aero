import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { Sequelize } from 'sequelize';

const atisDatabase: Sequelize = require('atis-database').sequelize;

@Controller('airport/:airport_icao')
export class AirportController {

    @Get()
    async getParamsFromAirport(@Param('airport_icao') airport: string): Promise<any>{
        return await atisDatabase.models.airport.findByPk(airport);
    }

    @Post()
    createParams(@Param('airport_icao') airport: string): void{
        atisDatabase.models.airport.create({
            airport_icao: airport,
            current_atis: airport[3],
        });
    }

    @Patch('remarks')
    updateParams(@Param('airport_icao') airport: string, @Body() remark: any): void{
        console.log(airport, remark);
        atisDatabase.models.airport.update({
            remarks: remark.remark,
        }, {
            where: {
                airport_icao: airport,
            }
        });
    }

    
}
