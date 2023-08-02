import { Module } from '@nestjs/common';
import { databaseProviders } from './database-connection';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseConnectionModule {}
