import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AtisModule } from './atis/atis.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConnectionModule } from './database-connection/database-connection.module';
import { RunwayParamsModule } from './runway-params/runway-params.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    AuthModule,
    AtisModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${ENV}`
    }),
    DatabaseConnectionModule,
    RunwayParamsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('atis', 'runway-params');
  }
}
