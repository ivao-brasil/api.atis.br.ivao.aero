import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Sequelize } from 'sequelize';

const atisDatabase: Sequelize = require('atis-database').sequelize;

@Controller('params/:airport_icao')
export class ParamsController {
    @Get()
    async getParamsFromAirport(@Param('airport_icao') airport: string): Promise<any>{
        return await atisDatabase.models.Params.findAll({
            where: {
                airport_icao: airport
            }
        });
    }

    @Get(':runway')
    async getParamsFromAirportAndRunway(@Param('airport_icao') airport: string, @Param('runway') runway: string): Promise<any>{
        return await atisDatabase.models.Params.findAll({
            where: {
                airport_icao: airport,
                runway: runway
            }
        });
    }

    @Post(':runway/:type')
    createParams(@Param('airport_icao') airport: string, @Param('runway') runway: string, @Param('type') type: 'LANDING' | 'TAKEOFF', @Body() param: any): void{
        atisDatabase.models.Params.create({
            airport_icao: airport,
            runway: runway,
            type: type,
            param: param,
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    @Patch(':runway/:type')
    updateParams(@Param('airport_icao') airport: string, @Param('runway') runway: string, @Param('type') type: 'LANDING' | 'TAKEOFF', @Body() param: any): void{
        atisDatabase.models.Params.update({
            airport_icao: airport,
            runway: runway,
            type: type,
            params: param,
            updated_at: new Date()
        }, {
            where: {
                airport_icao: airport,
                runway: runway,
                type: type
            }
        });
    }

    @Delete(':runway/:type')
    deleteParams(@Param('airport_icao') airport: string, @Param('runway') runway: string, @Param('type') type: 'LANDING' | 'TAKEOFF'): void{
        atisDatabase.models.Params.destroy({
            where: {
                airport_icao: airport,
                runway: runway,
                type: type
            }
        });
    }
}
