import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {} //dependency injection

  @Get('/all')
  getUsers() {
    return this.userService.getUsers();
  }

  // if we want to get it by mongodb generated ObjectID "_id"
  @Get('/get/:userId')
  getUser(@Param('userId') _id: string) {
    return this.userService.getUser(_id);
  }

  // if we want to get it by custom ID
  // @Get('/get/:userId')
  // getUser(@Param('userId') userId: string) {
  //   return this.userService.getUser({ userId });
  // }

  @Post('/create')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Patch('/update/:userId')
  updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('userId') _id: string,
  ) {
    return this.userService.updateUser(updateUserDto, _id);
  }

  @Delete('/delete/:userId')
  deleteUser(@Param('userId') _id: string) {
    return this.userService.deleteUser(_id);
  }
}
