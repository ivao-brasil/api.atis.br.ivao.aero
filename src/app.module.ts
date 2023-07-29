import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AtisModule } from './atis/atis.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { AirportParamsModule } from './airport-params/airport-params.module';
import { ConfigModule } from '@nestjs/config';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    AuthModule,
    AtisModule,
    AirportParamsModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${ENV}`
    })],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('atis');
  }
}
