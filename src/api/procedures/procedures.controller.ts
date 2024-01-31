import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Sequelize } from 'sequelize';

const atisDatabase: Sequelize = require('atis-database').sequelize;

@Controller('procedures/:airport_icao')
export class ProceduresController {
    @Get()
    async getProceduresFromAirport(@Param('airport_icao') airport: string): Promise<any>{
        console.log(atisDatabase.models);
        return await atisDatabase.models.procedures.findAll({
            where: {
                airport_icao: airport
            }
        });
    }

    @Get(':runway')
    async getProceduresFromAirportAndRunway(@Param('airport_icao') airport: string, @Param('runway') runway: string): Promise<any>{
        return await atisDatabase.models.procedures.findAll({
            where: {
                airport_icao: airport,
                runway: runway
            }
        });
    }

    @Post(':runway/:type/:procedure')
    createProcedure(@Param('airport_icao') airport: string, @Param('runway') runway: string, @Param('type') type: 'LANDING' | 'TAKEOFF', @Param('procedure') procedure: string): void{
        atisDatabase.models.procedures.create({
            airport_icao: airport,
            runway: runway,
            type: type,
            procedure: procedure
        });
    }

    @Delete(':runway/:type')
    deleteParams(@Param('airport_icao') airport: string, @Param('runway') runway: string, @Param('type') type: 'LANDING' | 'TAKEOFF', @Param('procedure') procedure: string): void{
        atisDatabase.models.procedures.destroy({
            where: {
                airport_icao: airport,
                runway: runway,
                type: type,
                procedure: procedure
            }
        });
    }
}
