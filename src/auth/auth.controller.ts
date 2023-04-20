import { Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { Body, Req } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Tokens } from './types/tokens.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Req() req: any, @Body() authDto: AuthDto): Promise<Tokens> {
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
}
