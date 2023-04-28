import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaClientGlobalMiddleware } from './common/middlewares/prisma-client.global.middleware';
import { PrismaClientModuleMiddleware } from './common/middlewares/prisma-client.module.middleware';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, ConfigModule.forRoot()],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PrismaClientGlobalMiddleware, PrismaClientModuleMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
