import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { CustomRequest } from '../../common/interface/request.interface'
import { UserService } from '../user.service'

@Injectable()
export class UserExist implements CanActivate {
  constructor(private readonly userService: UserService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    console.log('guard!')
    const req: CustomRequest = context.switchToHttp().getRequest()
    return this.validateRequest(req)
  }

  async validateRequest(req: CustomRequest): Promise<boolean> {
    const body = req.body as { email: string; username: string }
    const getEmail: User | null = await this.userService.getUserByEmail(
      req,
      body.email,
    )
    const getUsername: User | null = await this.userService.getUserByUsername(
      req,
      body.username,
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
