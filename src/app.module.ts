import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { ConfigModule } from '@nestjs/config';
import { ParamsModule } from './api/params/params.module';
import { AtisModule } from './api/atis/atis.module';
import { ProceduresController } from './api/procedures/procedures.controller';
import { ProceduresModule } from './api/procedures/procedures.module';
import { AirportController } from './api/airport/airport.controller';
import { AirportModule } from './api/airport/airport.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    AuthModule,
    AtisModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${ENV}`
    }),
    ParamsModule,
    ProceduresModule,
    AirportModule
  ],
  controllers: [AirportController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //consumer.apply(AuthMiddleware).forRoutes('atis', 'params');
  }
}
