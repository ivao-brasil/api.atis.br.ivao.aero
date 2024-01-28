import { Module } from '@nestjs/common';
import { AirportService } from './airport/airport.service';
import { MetarService } from './metar/metar.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        HttpModule,
        ConfigModule
    ],
    providers: [
        AirportService,
        MetarService
    ],
    exports: [
        AirportService,
        MetarService
    ]
})
export class ServicesModule {}
