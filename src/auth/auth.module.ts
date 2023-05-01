import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { JwtModule } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { EmailVerificationModule } from 'src/common/email/email-verification.module';
import { PrismaClientManager } from 'src/database/prisma-client-manager';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
    UserModule,
    EmailVerificationModule,
  ],
  controllers: [AuthController],
  providers: [
    UserService,
    AtStrategy,
    RtStrategy,
    AuthService,
    PrismaClient,
    PrismaClientManager,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
