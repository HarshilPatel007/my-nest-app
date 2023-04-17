import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaClientManager } from 'src/database/prisma-client-manager';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Tokens } from './types/tokens.types';

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    private prismaClient: PrismaClient,
    private prismaClientManager: PrismaClientManager,
  ) {}

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(username: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { username: username, email },
        { secret: 'at-secret', expiresIn: 60 * 30 }, // 30 minutes
      ),
      this.jwtService.signAsync(
        { username: username, email },
        { secret: 'rt-secret', expiresIn: 60 * 60 * 24 * 7 }, // one week
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  // generate meta field
  private generateMeta(req: any): string {
    const metaString = `${req.username?.toLowerCase()} | ${req.fullname?.toLowerCase()}`;
    return metaString;
  }
  async getUsers() {
    return await this.prismaClient.user.findMany();
  }

  async getUser(req: any, _id: string) {
    return await req.prismaClient.user.findUnique({
      where: { id: _id },
    });
  }

  // main use case to get the user from email address.
  // being used to get the loggedIn user as well.
  async getUserByEmail(email: string) {
    return await this.prismaClient.user.findUnique({
      where: { email },
    });
  }

  async getUserByUsername(username: string) {
    return await this.prismaClient.user.findUnique({ where: { username } });
  }

  async createUser(createUserDto: CreateUserDto) {
    const { username, email, password, age, fullname } = createUserDto;
    const hash = await this.hashData(password);
    const prismaClient = await this.prismaClientManager.createDatabase(
      username,
    );
    const newUser = await prismaClient.user.create({
      data: {
        email,
        username,
        password: hash,
        UserDetails: {
          create: {
            age,
            fullname,
          },
        },
      },
    });
    return newUser;
  }

  // async updateRtHash(username: string, rt: string) {
  //   const hash = await this.hashData(rt);
  //   const user = await this.userModel.where({ username: username });

  // }

  // user can not change password and username
  async updateUser(updateUserDto: UpdateUserDto, _id: string) {
    const { email, fullname, age } = updateUserDto;
    return await this.prismaClient.user.update({
      where: { id: _id },
      data: {
        email,
        UserDetails: {
          update: {
            age,
            fullname,
          },
        },
      },
    });
  }

  // add meta field to all existing documents/data
  // async updateAllUser(updateUserDto: UpdateUserDto) {
  //   const users = await this.prismaClient.user.findMany();

  //   users.map(async (user) => {
  //     updateUserDto.username = user.username;
  //     updateUserDto.fullname = user.userDetails.fullname;
  //     await this.prismaClient.user.update({
  //       where: { id: user.id },
  //       data: {
  //         meta: this.generateMeta(updateUserDto),
  //       },
  //     });
  //   });
  // }

  async deleteUser(_id: string) {
    return await this.prismaClient.user.delete({
      where: { id: _id },
    });
  }

  async loginUser(authDto: AuthDto): Promise<Tokens> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        email: authDto.email,
      },
    });
    const passwordMatches = await bcrypt.compare(
      authDto.password,
      user.password,
    );

    if (!user || !passwordMatches)
      throw new UnauthorizedException('email or password is incorrect!');
    const tokens = await this.getTokens(user.username, user.email);
    return tokens;
  }

  async changePassword(req: any, changePasswordDto: ChangePasswordDto) {
    const { password, newpassword } = changePasswordDto;
    const user = await this.prismaClient.user.findUnique({
      where: { id: req.user.id },
    });
    const check_passwd = await bcrypt.compare(password, user.password);
    if (check_passwd) {
      const hash = await this.hashData(newpassword);
      await this.prismaClient.user.update({
        where: { id: req.user.id },
        data: {
          password: hash,
        },
      });
      return new HttpException('Password Changed!', HttpStatus.OK);
    } else {
      throw new ForbiddenException('old password is incorrect!');
    }
  }
}
