import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { CustomRequest } from '../../common/interface/request.interface'
import { UserExistGuard } from '../types/user.types'
import { UserService } from '../user.service'

@Injectable()
export class UserExist implements CanActivate {
  constructor(private readonly userService: UserService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req: CustomRequest<UserExistGuard> = context
      .switchToHttp()
      .getRequest()
    return this.validateRequest(req)
  }

  async validateRequest(req: CustomRequest<UserExistGuard>): Promise<boolean> {
    const getEmail: User | null = await this.userService.getUserByEmail(
      req,
      req.body.email,
    )
    const getUsername: User | null = await this.userService.getUserByUsername(
      req,
      req.body.username,
    )
    if (getEmail) {
      throw new ForbiddenException('user with the same email already exist!')
    } else if (getUsername) {
      throw new ForbiddenException('username already taken!')
    } else {
      return true
    }
  }
}
