import { Module } from '@nestjs/common';
import { AirportController } from './airport.controller';
import { ServicesModule } from 'src/services/services.module';

@Module({
    controllers: [
        AirportController
    ],
    imports: [ServicesModule]
})
export class AirportModule {}
