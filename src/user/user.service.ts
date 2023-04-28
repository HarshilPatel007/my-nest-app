import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import EmailVerificationDto from 'src/common/email/dto/email-verification.dto';
import { EmailVerificationService } from 'src/common/email/email-verification.service';
import { PrismaClientManager } from 'src/database/prisma-client-manager';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private prismaClientManager: PrismaClientManager,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  private hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getUsers(req: any) {
    const users = await req.defaultPrismaClient.user.findMany();
    return users;
  }

  async getUserById(req: any, _id: string) {
    const user = await req.defaultPrismaClient.user.findUnique({
      where: { id: _id },
    });
    return user;
  }
  async getUserByEmail(req: any, email: string) {
    const user = await req.defaultPrismaClient.user.findUnique({
      where: { email },
    });
    return user;
  }

  async getUserByUsername(req: any, username: string) {
    const user = await req.defaultPrismaClient.user.findUnique({
      where: { username },
    });
    return user;
  }

  async createUser(req: any, createUserDto: CreateUserDto) {
    const { username, email, password, age, fullname } = createUserDto;
    const passwordHash = await this.hashData(password);
    //create DB
    await this.prismaClientManager.createDatabase(`db-${username}`);

    if (req.headers.dbnm === 'default') {
      try {
        await req.defaultPrismaClient.dBList.create({
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
    } else {
      throw new BadRequestException(`Please provide a 'dbnm' in headers`);
    }

    try {
      await req.defaultPrismaClient.user.create({
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
      await this.emailVerificationService.sendVerificationLink(email);
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong while creating your account.',
      );
    }

    return {
      message: `Verification mail has been sent to ${email}. Please verify your email address before 30 minutes to access the platform.`,
    };
  }

  // user can not update password and username
  async updateUser(req: any, updateUserDto: UpdateUserDto, _id: string) {
    const { email, fullname, age } = updateUserDto;
    return await req.defaultPrismaClient.user.update({
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

  async deleteUser(req: any, _id: string) {
    return await req.defaultPrismaClient.user.delete({
      where: { id: _id },
    });
  }

  private async markEmailAsVerified(req: any, email: string) {
    return await req.defaultPrismaClient.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
      },
    });
  }

  async verifyEmail(req: any, dto: EmailVerificationDto) {
    let getEmailFromToken = '';
    getEmailFromToken =
      await this.emailVerificationService.decodeVerificationToken(dto.token);
    const user = await this.getUserByEmail(req, getEmailFromToken);
    if (!user) {
      throw new BadRequestException('User not found!');
    }
    if (user.isEmailVerified) {
      throw new BadRequestException('Email address is already verified!');
    }
    await this.markEmailAsVerified(req, getEmailFromToken);
    return {
      message: 'Email address is verified!',
    };
  }
}
