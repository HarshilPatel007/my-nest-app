import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { CustomRequest } from '../../common/interface/request.interface'

@Injectable()
export class UserUpdate implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest()
    return this.validateRequest(req)
  }

  validateRequest(req: CustomRequest): boolean {
    const body = req.body as { username: string; password: string }
    if (body.username) {
      throw new ForbiddenException('Can not update username!')
    } else if (body.password) {
      throw new ForbiddenException('Can not update password!')
    } else {
      return true
    }
  }
}
