import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export default class EmailService {
  private nodemailerTransport: Mail;
  constructor(private readonly configService: ConfigService) {
    this.nodemailerTransport = createTransport({
      service: this.configService.get('SMTP_MAIL_SERVICE'),
      auth: {
        user: this.configService.get('SMTP_HOST_EMAIL'),
        pass: this.configService.get('SMTP_HOST_PASSWORD'),
      },
    });
  }

  sendEmail(options: Mail.Options) {
    return this.nodemailerTransport.sendMail(options);
  }
}