import { Module } from '@nestjs/common';
import { ProceduresController } from './procedures.controller';

@Module({
  controllers: [ProceduresController]
})
export class ProceduresModule {}
