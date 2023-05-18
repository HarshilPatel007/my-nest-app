import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { PrismaClientManager } from '../../database/prisma-client-manager'
import { CustomRequest } from '../interface/request.interface'

/* This is a middleware class that sets up a Prisma client for each incoming request based on
the database name provided in the request headers. Use at Global level. */
@Injectable()
export class PrismaClientGlobalMiddleware implements NestMiddleware {
  constructor(private prismaClientManager: PrismaClientManager) {}
  async use(req: CustomRequest, res: any, next: NextFunction) {
    console.log('global middleware!')
    if (req.headers) {
      req.prismaClient = await this.prismaClientManager.getPrismaClient(
        req.headers.dbnm,
      )
      req.defaultPrismaClient =
        await this.prismaClientManager.getDefaultPrismaClient()
      next()
    }
  }
}
