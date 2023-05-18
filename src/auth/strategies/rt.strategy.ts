import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { CustomRequest } from '../../common/interface/request.interface'

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // how we're going to get tokens?
      secretOrKey: configService.get<string>('JWT_RT_SECRET'),
      passReqToCallback: true,
    })
  }

  validate(req: CustomRequest, payload: Record<string, unknown>) {
    const authorizationHeader: string | undefined = req.get('authorization')
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is missing.')
    }
    const refreshToken: string = authorizationHeader
      .replace('Bearer', '')
      .trim()
    return {
      ...payload,
      refreshToken,
    }
  }
}
