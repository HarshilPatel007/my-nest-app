import { Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { Body, Get, Req } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  AuthDto,
  ChangePasswordDto,
  CheckSkip2FADto,
  Enable2FADto,
  ForgotPasswordDto,
  LoginOTPDto,
  Skip2FADto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Req() req: any, @Body() authDto: AuthDto) {
    return this.authService.login(req, authDto);
  }

  @Post('login/verify-otp')
  verifyOTPForLogin(@Req() req: any, @Body() loginOTPDto: LoginOTPDto) {
    return this.authService.verifyOTPForLogin(req, loginOTPDto);
  }

  @Patch('login/enable-2fa')
  enable2FA(@Req() req: any, @Body() enable2FADto: Enable2FADto) {
    return this.authService.enable2FA(req, enable2FADto);
  }

  @Patch('login/enable-skip2fa')
  enableSkip2FA(@Req() req: any, @Body() skip2FADto: Skip2FADto) {
    return this.authService.enableSkip2FA(req, skip2FADto);
  }

  @Patch('login/check-skip2fa')
  checkSkip2FA(@Req() req: any, @Body() checkSkip2FADto: CheckSkip2FADto) {
    return this.authService.checkSkip2FA(req, checkSkip2FADto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('password/change')
  changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req, changePasswordDto);
  }

  @Get('password/forgot')
  forgotPassword(@Req() req: any) {
    return this.authService.forgotPassword(req);
  }

  @Patch('password/forgot/verify-otp')
  verifyOTPForForgotPassword(
    @Req() req: any,
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.verifyOTPForForgotPassword(req, forgotPasswordDto);
  }
}
