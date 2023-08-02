import { Module } from '@nestjs/common';
import { AtisController } from './atis.controller';

@Module({
  controllers: [AtisController]
})
export class AtisModule {}
