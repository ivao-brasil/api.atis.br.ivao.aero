import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { existsSync } from 'fs';
import { join as pathJoin } from 'path';

async function bootstrap() {
  const pathToConfig = pathJoin(__dirname, '..','..','env-files','api.atis.br.ivao.aero.env');
  if( existsSync(pathToConfig) ) {
    require('dotenv').config({path:pathToConfig});
  }
  const app = await NestFactory.create(AppModule);
  const port = process.env.APP_PORT || 3000;
  console.log(`Listening to port ${port}`);
  await app.listen(port);
}
bootstrap();
