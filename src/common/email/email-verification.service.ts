import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CommonFunctions } from '../common.functions';
import EmailService from './email.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private emailService: EmailService,
    private commonFunctions: CommonFunctions,
  ) {}

  private token = '';
  private otp = '';

  public async sendVerificationTokenLink(email: string) {
    const payload = { email };
    this.token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: '30m',
    });

    const hashToken = await bcrypt.hash(this.token, 10);

    const url = `${this.configService.get('MAIL_URL')}?token=${hashToken}`;

    const text = `To confirm the email address, click this link: ${url}`;

    return await this.emailService.sendEmail({
      to: email,
      cc: this.configService.get('TEST_EMAIL'),
      subject: 'Email Verification',
      text,
    });
  }

  public async decodeVerificationToken(encodedToken: string) {
    const tokenMatches = await bcrypt.compare(this.token, encodedToken);
    if (!tokenMatches) {
      throw new HttpException(
        'Verification token is not matched!',
        HttpStatus.FORBIDDEN,
      );
    } else {
      try {
        const payload = await this.jwtService.verify(this.token, {
          secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
        });

        if (typeof payload === 'object' && 'email' in payload) {
          return payload.email;
        }
      } catch (error) {
        if (error?.name === 'TokenExpiredError') {
          throw new BadRequestException('Verification token expired!');
        }
        throw new BadRequestException('Bad verification token!');
      }
    }
  }

  public async sendVerificationOTP(email: string) {
    this.otp = this.commonFunctions.generateRandomString(
      10,
      true,
      true,
      true,
      false,
    );
    const text = `Your OTP.\n${this.otp}`;

    return await this.emailService.sendEmail({
      to: email,
      cc: this.configService.get('TEST_EMAIL'),
      subject: 'Email Verification',
      text,
    });
  }

  public async verifyOTP(otp: string) {
    if (this.otp !== otp) {
      throw new HttpException(`Invalid OTP!`, HttpStatus.FORBIDDEN);
    } else {
      return true;
    }
  }
}
