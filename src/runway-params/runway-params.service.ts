import { Inject, Injectable } from '@nestjs/common';
import { Repository, FindOptionsWhere } from 'typeorm';
import { RunwayParam } from './entities/runway-param.entity';

@Injectable()
export class RunwayParamsService {

  constructor(
    @Inject('RUNWAY_PARAM_REPOSITORY')
    private runwayRepository: Repository<RunwayParam>,
  ) {}

  async create(runwayParam: RunwayParam) {
    console.log(runwayParam);
    await this.runwayRepository.insert(runwayParam);
  }

  findOne(icaoId: string, runwayId: string): Promise<RunwayParam | null> {
    return this.runwayRepository.findOneBy({
      icaoCode: icaoId,
      runway: runwayId,
    } as FindOptionsWhere<any>);
  }

  async update(runwayParam: RunwayParam) {
    await this.runwayRepository.update({
      icaoCode: runwayParam.icaoCode,
      runway: runwayParam.runway,
    }, runwayParam);
  }

  async remove(icaoCode: string, runway: string) {
    await this.runwayRepository.delete({
      icaoCode: icaoCode,
      runway: runway,
    });
  }
}
