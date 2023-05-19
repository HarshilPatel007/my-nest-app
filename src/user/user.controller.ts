import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { Body, Req } from '@nestjs/common/decorators'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import EmailVerificationDto from '../common/email/dto/email-verification.dto'
import { CustomRequest } from '../common/interface/request.interface'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserExist } from './guards/user-exists.guard'
import { UserUpdate } from './guards/user-update.guard'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @Get('all')
  async getUsers(@Req() req: CustomRequest): Promise<User[]> {
    return await this.userService.getUsers(req)
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('me')
  getLoggedInUser(@Req() req: CustomRequest): Promise<User | undefined> {
    return Promise.resolve(req.user)
  }

  // if we want to get it by mongodb generated ObjectID "_id"
  @UseGuards(AuthGuard('jwt-access'))
  @Get('get/:userId')
  async getUser(
    @Req() req: CustomRequest,
    @Param('userId') _id: string,
  ): Promise<User | null> {
    return await this.userService.getUserById(req, _id)
  }

  @UseGuards(UserExist)
  @Post('create')
  async createUser(
    @Req() req: CustomRequest,
    @Body() createUserDto: CreateUserDto,
  ) {
    return await this.userService.createUser(req, createUserDto)
  }

  @Post('create/verify-email')
  async verify(@Req() req: CustomRequest, @Body() dto: EmailVerificationDto) {
    return await this.userService.verifyEmail(req, dto)
  }

  @UseGuards(AuthGuard('jwt-access'), UserExist, UserUpdate)
  @Patch('update')
  async updateUser(
    @Req() req: CustomRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.updateUser(req, updateUserDto, req.user.id)
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Delete('delete')
  async deleteUser(@Req() req: CustomRequest): Promise<User> {
    return await this.userService.deleteUser(req, req.user.id)
  }
}
