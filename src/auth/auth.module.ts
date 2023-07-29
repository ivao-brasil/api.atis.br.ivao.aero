import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { AuthMiddleware } from './auth.middleware';

@Module({
  providers: [AuthService, AuthMiddleware],
  imports: [HttpModule],
  exports: [AuthService, AuthMiddleware]
})
export class AuthModule {}
