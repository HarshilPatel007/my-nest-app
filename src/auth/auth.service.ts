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
import { CommonFunctions } from 'src/common/common.functions';
import { EmailVerificationService } from 'src/common/email/email-verification.service';
import { UserService } from 'src/user/user.service';
import { AuthDto, ChangePasswordDto, ForgotPasswordDto } from './dto/auth.dto';
import { Tokens } from './types/tokens.types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private readonly configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,
    private commonFunctions: CommonFunctions,
  ) {}

  private userEmail = '';

  private hashData(data: string) {
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

    // const accessToken: string = await this.commonFunctions.generateJWTToken(
    //   { username, email },
    //   this.configService.get('JWT_AT_SECRET'),
    //   '30m',
    // );

    // const refreshToken: string = await this.commonFunctions.generateJWTToken(
    //   { username, email },
    //   this.configService.get('JWT_RT_SECRET'),
    //   '7d',
    // );

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  // async updateRtHash(username: string, rt: string) {
  //   const hash = await this.hashData(rt);
  //   const user = await this.userModel.where({ username: username });
  // }

  async login(req: any, authDto: AuthDto) {
    console.log(req.defaultPrismaClient);
    const user = await this.userService.getUserByEmail(req, authDto.email);
    const passwordMatches = await bcrypt.compare(
      authDto.password,
      user.password,
    );

    if (!user || !passwordMatches)
      throw new UnauthorizedException('Email OR Password Is Incorrect!');
    const tokens = await this.getTokens(user.username, user.email);
    return {
      user,
      tokens,
    };
  }

  async changePassword(req: any, changePasswordDto: ChangePasswordDto) {
    const { password, newpassword } = changePasswordDto;
    const user = await this.userService.getUserById(req, req.user.id);

    const checkPassword = await bcrypt.compare(password, user.password);
    if (checkPassword) {
      const hashPassword = await this.hashData(newpassword);
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
      console.log(this.userEmail);
      await this.emailVerificationService.sendVerificationOTP(user.email);
    }
  }

  async verifyOTPForForgotPassword(
    req: any,
    forgotPasswordDto: ForgotPasswordDto,
  ) {
    const { newpassword, otp } = forgotPasswordDto;

    const verifyOTP = await this.emailVerificationService.verifyOTP(otp);

    if (verifyOTP) {
      const hashPassword = await this.hashData(newpassword);
      console.log(this.userEmail);

      await req.defaultPrismaClient.user.update({
        where: { email: this.userEmail },
        data: {
          password: hashPassword,
        },
      });

      return new HttpException('Password Changed!', HttpStatus.OK);
    }
  }
}
