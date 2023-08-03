import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { RunwayParamsService } from './runway-params.service';
import { RunwayParam } from './entities/runway-param.entity';
import { ApiJson } from 'src/interfaces/api-json.interface';

@Controller('runway-params/:icaoId/runway/:runwayId')
export class RunwayParamsController {
  constructor(private readonly runwayParamsService: RunwayParamsService) {}

  @Post()
  async create(@Param('icaoId') icaoId: string, @Param('runwayId') runwayId: string, @Body() {data}: ApiJson<RunwayParam>) {
    data.icaoCode = icaoId;
    data.runway = runwayId;
    return await this.runwayParamsService.create(data);
  }

  @Get()
  async findOne(@Param('icaoId') icaoId: string, @Param('runwayId') runwayId: string) {
    return await this.runwayParamsService.findOne(icaoId, runwayId);
  }

  @Put()
  async update(@Param('icaoId') icaoId: string, @Param('runwayId') runwayId: string, @Body() {data}: ApiJson<RunwayParam>) {
    data.icaoCode = icaoId;
    data.runway = runwayId;
    return await this.runwayParamsService.update(data);
  }

  @Delete()
  async remove(@Param('icaoId') icaoId: string, @Param('runwayId') runwayId: string) {
    return await this.runwayParamsService.remove(icaoId, runwayId);
  }
}
