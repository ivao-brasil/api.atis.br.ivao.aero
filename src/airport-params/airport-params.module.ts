import { Module } from '@nestjs/common';
import { AirportParamsService } from './airport-params.service';
import { AirportParamsController } from './airport-params.controller';

@Module({
  providers: [AirportParamsService],
  controllers: [AirportParamsController]
})
export class AirportParamsModule {}
