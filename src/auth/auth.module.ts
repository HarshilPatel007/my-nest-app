import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { JwtModule } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { EmailConfirmationService } from 'src/common/email/email-confirmation.service';
import EmailService from 'src/common/email/email.service';
import { PrismaClientModuleMiddleware } from 'src/common/middlewares/prisma-client.module.middleware';
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
    EmailConfirmationService,
    EmailService,
    AtStrategy,
    RtStrategy,
    AuthService,
    PrismaClient,
    PrismaClientManager,
  ],
  exports: [JwtModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PrismaClientModuleMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
