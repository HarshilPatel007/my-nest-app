import { Module } from '@nestjs/common';
import { PrismaClientManager } from './prisma-client-manager';

@Module({
  imports: [],
  providers: [PrismaClientManager],
  exports: [PrismaClientManager],
})
export class DatabaseModule {}
