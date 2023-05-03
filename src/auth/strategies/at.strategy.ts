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
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private userService: UserService,
    readonly configService: ConfigService,
  ) {
    super({
      passReqToCallback: true, // this'll pass the request as it is
      ignoreExpiration: false, // this'll ignore the expired tokens
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // how we're going to get tokens?
      secretOrKey: configService.get('JWT_AT_SECRET'),
    });
  }

  async validate(req: any, payload: JwtPayload) {
    console.log(req);
    const user = await this.userService.getUserByEmail(req, payload.email);
    return user;
  }
}
