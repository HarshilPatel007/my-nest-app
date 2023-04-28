import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NextFunction } from 'express';
import { PrismaClientManager } from 'src/database/prisma-client-manager';

/* This is a middleware class that checks if a database exists based on a header value
and throws an error if it doesn't. Use at Module level. */
@Injectable()
export class PrismaClientModuleMiddleware implements NestMiddleware {
  constructor(private prismaClientManager: PrismaClientManager) {}
  async use(req: any, res: any, next: NextFunction) {
    console.log('module middleware!');
    if (!req.headers.dbnm) {
      throw new BadRequestException(`Required header not found.`, {
        cause: new Error(),
        description: `Please provide a 'dbnm' in headers.`,
      });
    } else if (req.headers.dbnm === 'default') {
      next();
    } else if (req.headers.dbnm) {
      const defaultPrismaClient: PrismaClient =
        await this.prismaClientManager.getDefaultPrismaClient();

      const getDb = await defaultPrismaClient.dBList.findUnique({
        where: { dbname: req.headers.dbnm },
        select: { dbname: true },
      });

      if (getDb === null || req.headers.dbnm !== getDb.dbname) {
        throw new BadRequestException('Database not found.', {
          cause: new Error(),
          description: `Please provide correct 'dbnm' in headers.`,
        });
      } else {
        next();
      }
    }
  }
}
