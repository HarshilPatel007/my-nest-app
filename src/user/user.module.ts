import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { EmailConfirmationService } from 'src/common/email/email-confirmation.service';
import EmailService from 'src/common/email/email.service';
import { PrismaClientModuleMiddleware } from 'src/common/middlewares/prisma-client.module.middleware';
import { PrismaClientManager } from 'src/database/prisma-client-manager';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [ConfigModule],
  controllers: [UserController],
  providers: [
    UserService,
    EmailConfirmationService,
    EmailService,
    JwtService,
    PrismaClient,
    PrismaClientManager,
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PrismaClientModuleMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
