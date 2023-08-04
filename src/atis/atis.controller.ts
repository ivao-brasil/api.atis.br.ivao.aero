import { Controller, Get, Headers, Param } from '@nestjs/common';
import { MetarService } from './services/metar/metar.service';

@Controller('atis')
export class AtisController {

  constructor(private readonly metarService: MetarService) {}

  @Get(':icaoId')
  async getAtis(@Param('icaoId') icaoId: string, @Headers('Authorization') auth: string) {
    console.log(await this.metarService.getAerodromeMetar(icaoId, auth));
    return await this.metarService.getAerodromeMetar(icaoId, auth);
  }
}
