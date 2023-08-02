import { Module } from '@nestjs/common';
import { RunwayParamsService } from './runway-params.service';
import { RunwayParamsController } from './runway-params.controller';
import { runwayParamProvider } from './entities/runway-param.provider';
import { DatabaseConnectionModule } from 'src/database-connection/database-connection.module';

@Module({
  controllers: [RunwayParamsController],
  providers: [...runwayParamProvider, RunwayParamsService],
  imports: [DatabaseConnectionModule]
})
export class RunwayParamsModule {}
