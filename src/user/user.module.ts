import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { JwtModule } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { PrismaClientManager } from 'src/database/prisma-client-manager';
import { PrismaClientModuleMiddleware } from 'src/middleware/prisma-client.module.middleware';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [UserController],
  providers: [
    AtStrategy,
    RtStrategy,
    UserService,
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
