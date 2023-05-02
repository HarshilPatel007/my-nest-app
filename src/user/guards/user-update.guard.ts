import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UserUpdate implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    return this.validateRequest(req);
  }

  async validateRequest(req: any) {
    if (req.body.username) {
      throw new ForbiddenException('Can not update username!');
    } else if (req.body.password) {
      throw new ForbiddenException('Can not update password!');
    } else {
      return true;
    }
  }
}
