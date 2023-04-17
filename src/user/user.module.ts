import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { JwtModule } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { PrismaClientManager } from 'src/database/prisma-client-manager';
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
export class UserModule {}
