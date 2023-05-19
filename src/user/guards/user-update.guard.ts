import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { CustomRequest } from '../../common/interface/request.interface'
import { UserUpdateGuard } from '../types/user.types'

@Injectable()
export class UserUpdate implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: CustomRequest<UserUpdateGuard> = context
      .switchToHttp()
      .getRequest()
    return this.validateRequest(req)
  }

  validateRequest(req: CustomRequest<UserUpdateGuard>): boolean {
    if (req.body.username) {
      throw new ForbiddenException('Can not update username!')
    } else if (req.body.password) {
      throw new ForbiddenException('Can not update password!')
    } else {
      return true
    }
  }
}
