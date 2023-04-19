import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

/* This class manages connections to multiple Prisma databases and provides methods
for creating, retrieving, and destroying Prisma clients. */
@Injectable()
export class PrismaClientManager implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {}

  private clients: { [key: string]: PrismaClient } = {};
  private defaultPrismaClient: PrismaClient;

  private createConnection(dbNm: string) {
    const databaseUrl = this.configService
      .get('DATABASE_URL')
      .replace('DEFAULT', dbNm);
    return new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async getDefaultPrismaClient(): Promise<PrismaClient> {
    if (!this.defaultPrismaClient) {
      this.defaultPrismaClient = new PrismaClient();
    }
    return this.defaultPrismaClient;
  }

  async getPrismaClient(dbNm: string): Promise<PrismaClient> {
    console.log('getPrismaClient!');
    if (!dbNm) return this.defaultPrismaClient;

    let client: PrismaClient = this.clients[dbNm];

    if (!client) {
      client = this.createConnection(dbNm);
      this.clients[dbNm] = client;
    }
    return client;
  }

  getAllClients() {
    return this.clients;
  }

  async createDatabase(dbNm: string): Promise<PrismaClient> {
    let client: PrismaClient = this.clients[dbNm];
    client = this.createConnection(dbNm);
    return client;
  }

  async onModuleInit() {
    this.getDefaultPrismaClient();
    const getAllDb = await this.defaultPrismaClient.dBList.findMany({
      select: { dbname: true },
    });
    await Promise.all(
      getAllDb.map(async (db) => {
        const prismaClient = this.createConnection(db.dbname);
        this.clients[db.dbname] = prismaClient;
        return true;
      }),
    );
  }
  async onModuleDestroy() {
    await Promise.all(
      Object.values(this.clients).map((client) => client.$disconnect()),
    );
  }
}
