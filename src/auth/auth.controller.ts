import { Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { Body, Get, Req } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto, ChangePasswordDto, ForgotPasswordDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Req() req: any, @Body() authDto: AuthDto) {
    return this.authService.login(req, authDto);
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

  @Patch('password/verify-forgot-password')
  verifyOTPForForgotPassword(
    @Req() req: any,
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.verifyOTPForForgotPassword(req, forgotPasswordDto);
  }
}
