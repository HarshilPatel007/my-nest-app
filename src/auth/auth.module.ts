import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { JwtModule } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { EmailVerificationService } from 'src/common/email/email-verification.service';
import EmailService from 'src/common/email/email.service';
import { PrismaClientManager } from 'src/database/prisma-client-manager';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [AuthController],
  providers: [
    UserService,
    EmailVerificationService,
    EmailService,
    AtStrategy,
    RtStrategy,
    AuthService,
    PrismaClient,
    PrismaClientManager,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
