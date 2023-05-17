import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config/dist'
import { PrismaClient } from '@prisma/client'
import { CommonFunctions } from '../common/common.functions'
import { EmailVerificationModule } from '../common/email/email-verification.module'
import { PrismaClientManager } from '../database/prisma-client-manager'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [ConfigModule, EmailVerificationModule],
  controllers: [UserController],
  providers: [UserService, PrismaClient, PrismaClientManager, CommonFunctions],
})
export class UserModule {}
