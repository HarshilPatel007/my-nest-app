import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from '../user.service';

@Injectable()
export class UserExist implements CanActivate {
  constructor(private readonly userService: UserService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: any) {
    const get_email = await this.userService.getUserByEmail(request.body.email);
    const get_username = await this.userService.getUserByUsername(
      request.body.username,
    );
    if (get_email) {
      throw new ForbiddenException('user with the same email already exist!');
    } else if (get_username) {
      throw new ForbiddenException('username already taken!');
    } else {
      return true;
    }
  }
}
