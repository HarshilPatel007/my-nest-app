import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { PrismaClientManager } from 'src/database/prisma-client-manager';

/* This is a middleware class that sets up a Prisma client for each incoming request based on
the database name provided in the request headers. */
@Injectable()
export class PrismaClientGlobalMiddleware implements NestMiddleware {
  constructor(private prismaClientManager: PrismaClientManager) {}
  async use(req: any, res: any, next: NextFunction) {
    console.log('global middleware!');
    if (req.headers) {
      req.prismaClient = await this.prismaClientManager.getPrismaClient(
        req.headers.dbnm,
      );
      req.defaultPrismaClient =
        this.prismaClientManager.getDefaultPrismaClient();
      next();
    }
  }
}