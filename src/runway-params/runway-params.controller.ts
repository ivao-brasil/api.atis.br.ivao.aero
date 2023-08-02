import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RunwayParamsService } from './runway-params.service';
import { CreateRunwayParamDto } from './dto/create-runway-param.dto';
import { UpdateRunwayParamDto } from './dto/update-runway-param.dto';

@Controller('runway-params/:icaoId/runway/:runwayId')
export class RunwayParamsController {
  constructor(private readonly runwayParamsService: RunwayParamsService) {}

  @Post()
  create(@Body() createRunwayParamDto: CreateRunwayParamDto) {
    return this.runwayParamsService.create(createRunwayParamDto);
  }

  @Get()
  async findOne(@Param('icaoId') icaoId: string, @Param('runwayId') runwayId: string) {
    return await this.runwayParamsService.findOne(icaoId, runwayId);
  }

  @Patch()
  update(@Param('id') id: string, @Body() updateRunwayParamDto: UpdateRunwayParamDto) {
    return this.runwayParamsService.update(+id, updateRunwayParamDto);
  }

  @Delete()
  remove(@Param('id') id: string) {
    return this.runwayParamsService.remove(+id);
  }
}
