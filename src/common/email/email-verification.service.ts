import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import EmailService from './email.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  token = '';

  public async sendVerificationLink(email: string) {
    const payload = { email };
    this.token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    const hashedData = await bcrypt.hash(this.token, 10);

    const url = `${this.configService.get('MAIL_URL')}?token=${hashedData}`;

    const text = `Welcome to the application.\nTo confirm the email address, click this link: ${url}`;

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
        throw new BadRequestException();
      } catch (error) {
        if (error?.name === 'TokenExpiredError') {
          throw new BadRequestException('Verification token expired!');
        }
        throw new BadRequestException('Bad verification token!');
      }
    }
  }
}
