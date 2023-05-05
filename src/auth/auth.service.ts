import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailVerificationService } from 'src/common/email/email-verification.service';
import { UserService } from 'src/user/user.service';
import {
  AuthDto,
  ChangePasswordDto,
  CheckSkip2FADto,
  ForgotPasswordDto,
  LoginOTPDto,
  Skip2FADto,
} from './dto/auth.dto';
import { Tokens } from './types/tokens.types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private readonly configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  private userEmail = '';
  private loginTokens: Tokens = { accessToken: '', refreshToken: '' };

  private hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  async getTokens(username: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { username, email },
        { secret: this.configService.get('JWT_AT_SECRET'), expiresIn: '30m' }, // 30 minutes
      ),
      this.jwtService.signAsync(
        { username, email },
        {
          secret: this.configService.get('JWT_RT_SECRET'),
          expiresIn: '7d',
        }, // one week
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async login(req: any, authDto: AuthDto) {
    const user = await this.userService.getUserByEmail(req, authDto.email);

    const passwordMatches: boolean = await bcrypt.compare(
      authDto.password,
      user.password,
    );

    if (!user || !passwordMatches)
      throw new UnauthorizedException('Email OR Password Is Incorrect!');

    const tokens = await this.getTokens(user.username, user.email);

    this.loginTokens.accessToken = tokens.accessToken;
    this.loginTokens.refreshToken = tokens.refreshToken;

    if (user.is2FAEnabled) {
      if (user.skip2FA) {
        return {
          user,
          tokens,
        };
      } else {
        await this.emailVerificationService.sendVerificationOTP(user.email);
      }
      // return {
      //   token: this.loginTokens.accessToken,
      // };
    }

    return {
      user,
      tokens,
    };
  }

  async changePassword(req: any, changePasswordDto: ChangePasswordDto) {
    const { password, newpassword } = changePasswordDto;

    const user = await this.userService.getUserById(req, req.user.id);

    const checkPassword: boolean = await bcrypt.compare(
      password,
      user.password,
    );

    if (checkPassword) {
      const hashPassword: string = await this.hashData(newpassword);

      await req.defaultPrismaClient.user.update({
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

  async forgotPassword(req: any) {
    const user = await this.userService.getUserByEmail(req, req.body.email);

    if (user) {
      this.userEmail = user.email;

      await this.emailVerificationService.sendVerificationOTP(user.email);
    }
  }

  async verifyOTPForForgotPassword(
    req: any,
    forgotPasswordDto: ForgotPasswordDto,
  ) {
    const { newpassword, otp } = forgotPasswordDto;

    const verifyOTP: boolean = await this.emailVerificationService.verifyOTP(
      otp,
    );

    if (verifyOTP) {
      const hashPassword: string = await this.hashData(newpassword);

      await req.defaultPrismaClient.user.update({
        where: { email: this.userEmail },
        data: {
          password: hashPassword,
        },
      });

      return new HttpException('Password Changed!', HttpStatus.OK);
    }
  }

  async verifyOTPForLogin(req: any, loginOTPDto: LoginOTPDto) {
    const { otp } = loginOTPDto;

    const verifyOTP: boolean = await this.emailVerificationService.verifyOTP(
      otp,
    );

    if (verifyOTP) {
      const payload = await this.jwtService.verify(
        this.loginTokens.accessToken,
        {
          secret: this.configService.get('JWT_AT_SECRET'),
        },
      );

      const user = await this.userService.getUserByEmail(req, payload.email);

      return {
        user,
        tokens: this.loginTokens,
      };
    }
  }

  async enableSkip2FA(req: any, skip2FADto: Skip2FADto) {
    const { email } = skip2FADto;

    const user = await this.userService.getUserByEmail(req, email);

    const skip2FAToken: string = this.jwtService.sign(user.email, {
      secret: this.configService.get('JWT_SKIP2FA_TOKEN_SECRET'),
      expiresIn: '5m',
    });

    return await req.defaultPrismaClient.user.update({
      where: { email: user.email },
      data: {
        skip2FA: true,
        skip2FAToken,
      },
    });
  }

  async checkSkip2FA(req: any, checkSkip2FADto: CheckSkip2FADto) {
    const { email } = checkSkip2FADto;

    const user = await this.userService.getUserByEmail(req, email);

    if (user.skip2FAToken !== null && user.skip2FA === true) {
      try {
        await this.jwtService.verify(user.skip2FAToken, {
          secret: this.configService.get('JWT_SKIP2FA_TOKEN_SECRET'),
        });
      } catch (error) {
        if (error?.name === 'TokenExpiredError') {
          return await req.defaultPrismaClient.user.update({
            where: { email: user.email },
            data: {
              skip2FA: false,
              skip2FAToken: null,
            },
          });
          // return {
          //   user,
          //   tokens: this.loginTokens,
          // };
        }
        throw new BadRequestException('Bad verification token!');
      }
    }
    // } else {
    //   return {
    //     user,
    //     tokens: this.loginTokens,
    //   };
    // }
  }
}
