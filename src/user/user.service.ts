import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { CommonFunctions } from '../common/common.functions'
import EmailVerificationDto from '../common/email/dto/email-verification.dto'
import { EmailVerificationService } from '../common/email/email-verification.service'
import { CustomRequest } from '../common/interface/request.interface'
import { PrismaClientManager } from '../database/prisma-client-manager'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(
    private prismaClientManager: PrismaClientManager,
    private emailVerificationService: EmailVerificationService,
    private commonFunctions: CommonFunctions,
  ) {}

  private hashData(data: string) {
    return bcrypt.hash(data, 10)
  }

  async getUsers(req: CustomRequest): Promise<User[]> {
    const users: User[] = await req.defaultPrismaClient.user.findMany()
    return users
  }

  async getUserById(
    req: CustomRequest,
    _id: string | undefined = '',
  ): Promise<User | null> {
    const user: User | null = await req.defaultPrismaClient.user.findUnique({
      where: { id: _id },
    })
    return user
  }

  async getUserByEmail(
    req: CustomRequest,
    email: string,
  ): Promise<User | null> {
    const user: User | null = await req.defaultPrismaClient.user.findUnique({
      where: { email },
    })
    return user
  }

  async getUserByUsername(
    req: CustomRequest,
    username: string,
  ): Promise<User | null> {
    const user: User | null = await req.defaultPrismaClient.user.findUnique({
      where: { username },
    })
    return user
  }

  async createUser(req: CustomRequest, createUserDto: CreateUserDto) {
    const { username, email, password, age, fullname } = createUserDto
    const passwordHash = await this.hashData(password)

    if (req.headers.dbnm === 'default') {
      if (this.commonFunctions.validString(username, '-_')) {
        // create User
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
          })
          await this.emailVerificationService.sendVerificationTokenLink(email)
        } catch (error) {
          throw new BadRequestException(
            'Something went wrong while creating your account.',
          )
        }

        // create DB
        try {
          await this.prismaClientManager.createDatabase(`db-${username}`)
        } catch (error) {
          throw new HttpException(
            'Something went wrong while creating the database.',
            HttpStatus.INTERNAL_SERVER_ERROR,
            {
              cause: error as Error,
            },
          )
        }

        // create DB entry in default DB
        try {
          await req.defaultPrismaClient.dBList.create({
            data: {
              dbname: `db-${username}`,
            },
          })
        } catch (error) {
          throw new BadRequestException('Database already exists.', {
            cause: error as Error,
            description: `If you're trying to create a new user, please change the username OR add 'dbnm' in headers if you have already registered your account.`,
          })
        }
      } else {
        throw new BadRequestException(
          `Only _,-,A-Z,a-z,0-9 allowed in username.`,
        )
      }
    } else {
      throw new BadRequestException(`Please provide a 'dbnm' in headers`)
    }

    return {
      message: `Verification mail has been sent to ${email}. Please verify your email address before 30 minutes to access the platform.`,
    }
  }

  // user can not update password and username
  async updateUser(
    req: CustomRequest,
    updateUserDto: UpdateUserDto,
    _id: string,
  ): Promise<User> {
    const { email, fullname, age } = updateUserDto

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
    })
  }

  async deleteUser(req: CustomRequest, _id: string): Promise<User> {
    return await req.defaultPrismaClient.user.delete({
      where: { id: _id },
    })
  }

  private async markEmailAsVerified(
    req: CustomRequest,
    email: string,
  ): Promise<User> {
    return await req.defaultPrismaClient.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
      },
    })
  }

  async verifyEmail(req: CustomRequest, dto: EmailVerificationDto) {
    const getEmailFromToken: string | undefined =
      await this.emailVerificationService.decodeVerificationToken(dto.token)
    const user: User | null = await this.getUserByEmail(
      req,
      getEmailFromToken?.trim() || '',
    )
    if (!user) {
      throw new BadRequestException('User not found!')
    }
    if (user.isEmailVerified) {
      throw new BadRequestException('Email address is already verified!')
    }
    try {
      await this.markEmailAsVerified(req, getEmailFromToken?.trim() || '')
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.response.statusCode === HttpStatus.NOT_FOUND) {
        throw new NotFoundException('Email verification not found!')
      } else {
        throw new InternalServerErrorException(
          'Could not mark email as verified!',
        )
      }
    }
    throw new HttpException('Email address is now verified!', HttpStatus.OK)
  }
}
