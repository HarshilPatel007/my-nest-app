import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClientManager } from './prisma-client-manager';

@Module({
  providers: [ConfigService, PrismaClientManager],
  exports: [PrismaClientManager],
})
export class DatabaseModule {}
