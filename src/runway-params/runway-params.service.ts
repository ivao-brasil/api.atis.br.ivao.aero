import { Inject, Injectable } from '@nestjs/common';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateRunwayParamDto } from './dto/create-runway-param.dto';
import { UpdateRunwayParamDto } from './dto/update-runway-param.dto';
import { RunwayParam } from './entities/runway-param.entity';

@Injectable()
export class RunwayParamsService {

  constructor(
    @Inject('RUNWAY_PARAM_REPOSITORY')
    private runwayRepository: Repository<RunwayParam>,
  ) {}

  create(runwayParamDto: CreateRunwayParamDto) {
    return 'This action adds a new runwayParam';
  }

  findOne(icaoId: string, runwayId: string): Promise<RunwayParam | null> {
    return this.runwayRepository.findOneBy({
      icaoCode: icaoId,
      runway: runwayId,
    } as FindOptionsWhere<any>);
  }

  update(id: number, updateRunwayParamDto: UpdateRunwayParamDto) {
    return `This action updates a #${id} runwayParam`;
  }

  remove(id: number) {
    return `This action removes a #${id} runwayParam`;
  }
}
