import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Body, Req } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import EmailVerificationDto from 'src/common/email/dto/email-verification.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserExist } from './guards/user-exists.guard';
import { UserUpdate } from './guards/user-update.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @Get('all')
  async getUsers(@Req() req: any) {
    return await this.userService.getUsers(req);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('me')
  async getLoggedInUser(@Req() req: any) {
    return await req.user;
  }

  // if we want to get it by mongodb generated ObjectID "_id"
  @UseGuards(AuthGuard('jwt-access'))
  @Get('get/:userId')
  async getUser(@Req() req: any, @Param('userId') _id: string) {
    console.log('controller', req.defaultPrismaClient);
    return await this.userService.getUserById(req, _id);
  }

  @UseGuards(UserExist)
  @Post('create')
  async createUser(@Req() req: any, @Body() createUserDto: CreateUserDto) {
    console.log('controller!');
    return await this.userService.createUser(req, createUserDto);
  }

  @UseGuards(AuthGuard('jwt-access'), UserExist, UserUpdate)
  @Patch('update')
  async updateUser(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUser(req, updateUserDto, req.user.id);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Delete('delete')
  async deleteUser(@Req() req: any) {
    return await this.userService.deleteUser(req, req.user.id);
  }

  @Post('verify-email')
  async verify(@Req() req: any, @Body() dto: EmailVerificationDto) {
    return await this.userService.verifyEmail(req, dto);
  }
}
