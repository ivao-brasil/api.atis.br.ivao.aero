import { Module } from '@nestjs/common';
import { AirportController } from './airport.controller';

@Module({
    controllers: [
        AirportController
    ],
})
export class AirportModule {}
