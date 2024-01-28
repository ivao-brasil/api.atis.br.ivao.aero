import { Module } from '@nestjs/common';
import { ParamsController } from './params.controller';

@Module({
  controllers: [ParamsController]
})
export class ParamsModule {}
