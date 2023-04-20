import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

type JwtPayload = {
  username: string;
  email: string;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // how we're going to get tokens?
      secretOrKey: configService.get('JWT_AT_SECRET'),
    });
  }

  validate(req: any, payload: JwtPayload) {
    return this.userService.getUserByEmail(req, payload.email);
  }
}
