import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user.service';

@Injectable()
export class UserExist implements CanActivate {
  constructor(private readonly userService: UserService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    console.log('guard!');
    const req = context.switchToHttp().getRequest();
    return this.validateRequest(req);
  }

  async validateRequest(req: any) {
    const getEmail = await this.userService.getUserByEmail(req, req.body.email);
    const getUsername = await this.userService.getUserByUsername(
      req,
      req.body.username,
    );
    if (getEmail) {
      throw new ForbiddenException('user with the same email already exist!');
    } else if (getUsername) {
      throw new ForbiddenException('username already taken!');
    } else {
      return true;
    }
  }
}
