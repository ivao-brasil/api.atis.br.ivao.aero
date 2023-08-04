import { Module } from '@nestjs/common';
import { AtisController } from './atis.controller';
import { MetarService } from './services/metar/metar.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [AtisController],
  imports: [HttpModule, ConfigModule],
  providers: [MetarService]
})
export class AtisModule {}
