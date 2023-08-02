import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { AuthMiddleware } from './auth.middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [AuthService, AuthMiddleware],
  imports: [HttpModule, ConfigModule],
  exports: [AuthService, AuthMiddleware]
})
export class AuthModule {}
