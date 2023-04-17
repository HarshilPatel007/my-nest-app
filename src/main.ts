import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientManager } from './database/prisma-client-manager';
import { WorkspaceInterceptor } from './interceptor/interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(
    new WorkspaceInterceptor(app.get<PrismaClientManager>(PrismaClientManager)),
  );
  await app.listen(3000);
}
bootstrap();
