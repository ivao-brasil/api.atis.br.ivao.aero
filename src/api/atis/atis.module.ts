import { Module } from '@nestjs/common';
import { AtisController } from './atis.controller';
import { ServicesModule } from 'src/services/services.module';

@Module({
  controllers: [AtisController],
  imports: [ServicesModule]
})
export class AtisModule {}
