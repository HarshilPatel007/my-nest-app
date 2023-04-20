import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Tokens } from './types/tokens.types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    readonly configService: ConfigService,
  ) {}

  private hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(username: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { username: username, email },
        { secret: this.configService.get('JWT_AT_SECRET'), expiresIn: 60 * 30 }, // 30 minutes
      ),
      this.jwtService.signAsync(
        { username: username, email },
        {
          secret: this.configService.get('JWT_RT_SECRET'),
          expiresIn: 60 * 60 * 24 * 7,
        }, // one week
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  // async updateRtHash(username: string, rt: string) {
  //   const hash = await this.hashData(rt);
  //   const user = await this.userModel.where({ username: username });

  // }

  async login(req: any, authDto: AuthDto): Promise<Tokens> {
    const user = await this.userService.getUserByEmail(req, authDto.email);
    const passwordMatches = await bcrypt.compare(
      authDto.password,
      user.password,
    );

    if (!user || !passwordMatches)
      throw new UnauthorizedException('Email OR Password Is Incorrect!');
    const tokens = await this.getTokens(user.username, user.email);
    return tokens;
  }

  async changePassword(req: any, changePasswordDto: ChangePasswordDto) {
    const { password, newpassword } = changePasswordDto;
    const user = await this.userService.getUserById(req, req.user.id);

    const checkPassword = await bcrypt.compare(password, user.password);
    if (checkPassword) {
      const hashPassword = await this.hashData(newpassword);
      await req.prismaClient.user.update({
        where: { id: req.user.id },
        data: {
          password: hashPassword,
        },
      });
      return new HttpException('Password Changed!', HttpStatus.OK);
    } else {
      throw new ForbiddenException('Old Password Is Incorrect!');
    }
  }
}
