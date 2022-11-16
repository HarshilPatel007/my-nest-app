import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { AuthDto } from './dto/auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserExist } from './guards/user-exists.guard';
import { Tokens } from './types/tokens.types';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {} //dependency injection

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  getUsers() {
    return this.userService.getUsers();
    // return req.user; @Request req
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getUser')
  getloggedInUser(@Request() req: any) {
    return req.user;
  }

  // if we want to get it by mongodb generated ObjectID "_id"
  @UseGuards(AuthGuard('jwt'))
  @Get('get/:userId')
  getUser(@Param('userId') _id: string) {
    return this.userService.getUser(_id);
  }

  @UseGuards(UserExist)
  @Post('create')
  createUser(@Body() createUserDto: CreateUserDto): Promise<Tokens> {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update/:userId')
  updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('userId') _id: string,
  ) {
    return this.userService.updateUser(updateUserDto, _id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:userId')
  deleteUser(@Param('userId') _id: string) {
    return this.userService.deleteUser(_id);
  }

  @Post('login')
  signinLocal(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.userService.loginUser(authDto);
  }
}
