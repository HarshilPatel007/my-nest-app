import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { EmailVerificationService } from 'src/common/email/email-verification.service';
import EmailService from 'src/common/email/email.service';
import { PrismaClientManager } from 'src/database/prisma-client-manager';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [ConfigModule],
  controllers: [UserController],
  providers: [
    UserService,
    EmailVerificationService,
    EmailService,
    JwtService,
    PrismaClient,
    PrismaClientManager,
  ],
})
export class UserModule {}
