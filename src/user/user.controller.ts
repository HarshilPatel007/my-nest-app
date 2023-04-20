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
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserExist } from './guards/user-exists.guard';
import { UserUpdate } from './guards/user-update.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // @UseGuards(AuthGuard('jwt'))
  @Get('all')
  getUsers(@Req() req: any) {
    return this.userService.getUsers(req);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getLoggedInUser(@Req() req: any) {
    return req.user;
  }

  // if we want to get it by mongodb generated ObjectID "_id"
  // @UseGuards(AuthGuard('jwt'))
  @Get('get/:userId')
  getUser(@Req() req: any, @Param('userId') _id: string) {
    return this.userService.getUserById(req, _id);
  }

  @UseGuards(UserExist)
  @Post('create')
  createUser(
    @Req() req: any,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    console.log('controller!');
    return this.userService.createUser(req, createUserDto);
  }

  @UseGuards(AuthGuard('jwt'), UserExist, UserUpdate)
  @Patch('update')
  updateUser(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(req, updateUserDto, req.user.id);
  }

  // @UseGuards(AuthGuard('jwt'), UserExist, UserUpdate)
  // @Patch('update-all')
  // updateAllUser(@Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.updateAllUser(updateUserDto);
  // }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete')
  deleteUser(@Req() req: any) {
    return this.userService.deleteUser(req, req.user.id);
  }
}
