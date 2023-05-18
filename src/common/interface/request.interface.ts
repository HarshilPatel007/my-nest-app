import { PrismaClient, User } from '@prisma/client'
import { Request } from 'express'

export interface CustomRequest<T = unknown> extends Request {
  defaultPrismaClient: PrismaClient
  prismaClient: PrismaClient
  headers: { [key: string]: string }
  user: User
  body: T
}
