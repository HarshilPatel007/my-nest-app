import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // how we're going to get tokens?
      secretOrKey: configService.get('JWT_RT_SECRET'),
      passReqToCallback: true,
    })
  }

  validate(req: any, payload: any) {
    const refreshToken: string = req
      .get('authorization')
      .replace('Bearer', '')
      .trim()
    return {
      ...payload,
      refreshToken,
    }
  }
}
