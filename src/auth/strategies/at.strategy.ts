import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { User } from '@prisma/client'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { CustomRequest } from '../../common/interface/request.interface'
import { UserService } from '../../user/user.service'

type JwtPayload = {
  username: string
  email: string
}

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private userService: UserService,
    readonly configService: ConfigService,
  ) {
    super({
      passReqToCallback: true, // this'll pass the request as it is
      ignoreExpiration: false, // this'll ignore the expired tokens
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // how we're going to get tokens?
      secretOrKey: configService.get<string>('JWT_AT_SECRET'),
    })
  }

  async validate(req: CustomRequest, payload: JwtPayload): Promise<User | null> {
    const user: User | null = await this.userService.getUserByEmail(
      req,
      payload.email,
    )
    return user
  }
}
