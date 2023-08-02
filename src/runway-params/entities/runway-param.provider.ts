import { DataSource } from 'typeorm';
import { RunwayParam } from './runway-param.entity';

export const runwayParamProvider = [
  {
    provide: 'RUNWAY_PARAM_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(RunwayParam),
    inject: ['DATA_SOURCE'],
  },
];