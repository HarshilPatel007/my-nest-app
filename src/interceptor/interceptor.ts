import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaClientManager } from 'src/database/prisma-client-manager';

@Injectable()
export class WorkspaceInterceptor implements NestInterceptor {
  constructor(private prismaClientManager: PrismaClientManager) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const [req] = context.getArgs();
    const { headers } = req;
    if (headers) {
      req.prismaClient = await this.prismaClientManager.getPrismaClient(
        headers.wpslg,
      );
      req.regPrismaClient = this.prismaClientManager.getDefaultPrismaClient();
    }
    return next.handle().pipe(tap(() => {}));
  }
}
