import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CommonFunctions } from '../common.functions';
import { EmailVerificationService } from './email-verification.service';
import EmailService from './email.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    EmailVerificationService,
    JwtService,
    EmailService,
    CommonFunctions,
  ],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
