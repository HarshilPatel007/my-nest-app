import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from '../user.service';

@Injectable()
export class UserUpdate implements CanActivate {
  constructor(private readonly userService: UserService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: any) {
    if (request.body.username) {
      throw new BadRequestException('can not update username!');
    } else if (request.body.password) {
      throw new BadRequestException('can not update password!');
    } else {
      return true;
    }
  }
}
