import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user.service';

type JwtPayload = {
  username: string;
  email: string;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // how we're going to get tokens?
      secretOrKey: 'at-secret',
    });
  }

  validate(payload: JwtPayload) {
    return this.userService.getUserByEmail(payload.email);
  }
}
