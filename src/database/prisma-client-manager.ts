import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

/* This class manages connections to multiple databases and provides methods
for creating, retrieving, and destroying Prisma clients. */
@Injectable()
export class PrismaClientManager implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {}

  private clients: { [key: string]: PrismaClient } = {};
  private defaultPrismaClient: PrismaClient;

  private createConnection(dbNm: string): PrismaClient {
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
      console.log('defPrismaClient-1');
      return (this.defaultPrismaClient = new PrismaClient());
    }
    console.log('defPrismaClient-2');
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

  async createDatabase(dbNm: string) {
    let client: PrismaClient = this.clients[dbNm];
    client = this.createConnection(dbNm);
    return await client.emptyCollection.create({
      data: {},
    });
  }

  async onModuleInit() {
    await this.getDefaultPrismaClient();
    const getAllDb = await this.defaultPrismaClient.dBList.findMany({
      select: { dbname: true },
    });
    await Promise.all(
      getAllDb.map((db) => {
        const prismaClient: PrismaClient = this.createConnection(db.dbname);
        this.clients[db.dbname] = prismaClient;
        return true;
      }),
    );
  }

  async onModuleDestroy() {
    await Promise.all(
      Object.values(this.clients).map((client: PrismaClient) =>
        client.$disconnect(),
      ),
    );
  }
}
