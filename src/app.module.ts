import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { PrismaClientGlobalMiddleware } from './middleware/prisma-client.global.middleware';
import { UserModule } from './user/user.module';

@Module({
  imports: [DatabaseModule, UserModule, ConfigModule.forRoot()],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PrismaClientGlobalMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
