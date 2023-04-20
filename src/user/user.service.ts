import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EmailConfirmationService } from 'src/common/email/email-confirmation.service';
import { PrismaClientManager } from 'src/database/prisma-client-manager';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private prismaClientManager: PrismaClientManager,
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  private hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  // generate meta field
  private generateMeta(req: any): string {
    const metaString = `${req.username?.toLowerCase()} | ${req.fullname?.toLowerCase()}`;
    return metaString;
  }
  async getUsers(req: any) {
    const users = await req.prismaClient.user.findMany();
    return users;
  }

  async getUserById(req: any, _id: string) {
    const user = await req.prismaClient.user.findUnique({
      where: { id: _id },
    });
    return user;
  }

  // being used to get the loggedIn user.
  async getUserByEmail(req: any, email: string) {
    const user = await req.prismaClient.user.findUnique({
      where: { email },
    });
    return user;
  }

  async getUserByUsername(req: any, username: string) {
    const user = await req.prismaClient.user.findUnique({
      where: { username },
    });
    return user;
  }

  async createUser(req: any, createUserDto: CreateUserDto) {
    const { username, email, password, age, fullname } = createUserDto;
    const passwordHash = await this.hashData(password);
    //create DB
    const prismaClient: PrismaClient =
      await this.prismaClientManager.createDatabase(`db-${username}`);

    if (!req.headers.dbnm) {
      try {
        await prismaClient.dBList.create({
          data: {
            dbname: `db-${username}`,
          },
        });
      } catch (error) {
        throw new BadRequestException('Database already exists.', {
          cause: error,
          description: `If you're trying to create a new user, please change the username OR add 'dbnm' in headers if you have already registered your account.`,
        });
      }
    }

    const createUser = await prismaClient.user.create({
      data: {
        email,
        username,
        password: passwordHash,
        UserDetails: {
          create: {
            age,
            fullname,
          },
        },
      },
    });

    await this.emailConfirmationService.sendVerificationLink(email);

    return createUser;
  }

  // user can not update password and username
  async updateUser(req: any, updateUserDto: UpdateUserDto, _id: string) {
    const { email, fullname, age } = updateUserDto;
    return await req.prismaClient.user.update({
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

  async deleteUser(req: any, _id: string) {
    return await req.prismaClient.user.delete({
      where: { id: _id },
    });
  }
}
