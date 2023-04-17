import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaClientManager implements OnModuleDestroy {
  // constructor(private configService: ConfigService) {}
  private clients: { [key: string]: PrismaClient } = {};
  private defaultPrismaClient: PrismaClient;

  private createConnection(dbNm: string) {
    // const databaseUrl = this.configService.get('DATABASE_URL');
    const tenantDBUrl = process.env.DATABASE_URL?.replace('test2', dbNm);
    return new PrismaClient({
      datasources: {
        db: {
          url: tenantDBUrl,
        },
      },
    });
  }

  getDefaultPrismaClient(): PrismaClient {
    if (!this.defaultPrismaClient) {
      this.defaultPrismaClient = new PrismaClient();
    }
    return this.defaultPrismaClient;
  }

  async onModuleInit() {
    this.getDefaultPrismaClient();
    const model = this.defaultPrismaClient.user;
    const workspaces = await model.findMany({
      where: {},
      select: { username: true },
    });
    await Promise.all(
      workspaces.map(async (wp) => {
        const prismaClient = this.createConnection(wp.username);
        this.clients[wp.username] = prismaClient;
        return true;
      }),
    );
  }

  getPrismaClient(tenantId: string): PrismaClient {
    let client = this.clients[tenantId];
    if (!client) {
      client = this.createConnection(tenantId);
    }
    return client;
  }

  // async getPrismaClient(wpSlg: string) {
  //   if (!wpSlg) {
  //     return this.defaultPrismaClient;
  //   }
  //   if (!dbNm) {
  //     let model = this.defaultPrismaClient.user;
  //     let wp = await model.findFirst({
  //       where: { slg: wpSlg },
  //     });
  //     dbNm = wp?.dbNm;
  //   }
  //   if (!this.clients[dbNm]) {
  //     this.clients[dbNm] = this.createConnection(dbNm);
  //   }
  //   return this.clients[dbNm];
  // }

  async createDatabase(dbNm: string): Promise<PrismaClient> {
    let client = this.clients[dbNm];
    client = this.createConnection(dbNm);
    return client;
  }

  async onModuleDestroy() {
    await Promise.all(
      Object.values(this.clients).map((client) => client.$disconnect()),
    );
  }
}
