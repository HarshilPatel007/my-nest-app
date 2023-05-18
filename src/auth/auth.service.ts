import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { EmailVerificationService } from '../common/email/email-verification.service'
import { CustomRequest } from '../common/interface/request.interface'
import { UserService } from '../user/user.service'
import {
  AuthDto,
  ChangePasswordDto,
  CheckSkip2FADto,
  Enable2FADto,
  ForgotPasswordDto,
  LoginOTPDto,
  Skip2FADto,
} from './dto/auth.dto'
import {
  Tokens,
  commonRequest,
  forgotPasswordRequest,
  loginOTPRequest,
} from './types/auth.types'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private readonly configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  private userEmail = ''
  private loginTokens: Tokens = { accessToken: '', refreshToken: '' }

  private hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10)
  }

  async getTokens(username: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { username, email },
        { secret: this.configService.get('JWT_AT_SECRET'), expiresIn: '30m' },
      ),
      this.jwtService.signAsync(
        { username, email },
        { secret: this.configService.get('JWT_RT_SECRET'), expiresIn: '7d' },
      ),
    ])

    return {
      accessToken: at,
      refreshToken: rt,
    }
  }

  async login(req: CustomRequest, authDto: AuthDto) {
    const user: User | null = await this.userService.getUserByEmail(
      req,
      authDto.email,
    )

    if (!user)
      throw new UnauthorizedException('Email OR Password Is Incorrect!')

    const passwordMatches: boolean = await bcrypt.compare(
      authDto.password,
      user.password,
    )

    if (!passwordMatches)
      throw new UnauthorizedException('Email OR Password Is Incorrect!')

    const tokens = await this.getTokens(user.username, user.email)

    this.loginTokens.accessToken = tokens.accessToken
    this.loginTokens.refreshToken = tokens.refreshToken

    if (user.is2FAEnabled) {
      if (user.skip2FA) {
        return {
          user,
          tokens,
        }
      } else {
        await this.emailVerificationService.sendVerificationOTP(user.email)
        return {
          message: 'The OTP has been sent to your mail.',
          user,
        }
      }
    } else {
      return {
        user,
        tokens,
      }
    }
  }

  async changePassword(
    req: CustomRequest,
    changePasswordDto: ChangePasswordDto,
  ): Promise<HttpException> {
    const { password, newpassword } = changePasswordDto

    const user: User | null = await this.userService.getUserById(
      req,
      req.user?.id,
    )

    if (user && (await bcrypt.compare(password, user.password))) {
      const hashPassword: string = await this.hashData(newpassword)

      await req.defaultPrismaClient.user.update({
        where: { id: req.user?.id },
        data: {
          password: hashPassword,
        },
      })

      return new HttpException('Password Changed!', HttpStatus.OK)
    } else {
      throw new ForbiddenException('Old Password Is Incorrect!')
    }
  }

  async forgotPassword(req: CustomRequest<forgotPasswordRequest>) {
    const user: User | null = await this.userService.getUserByEmail(
      req,
      req.body.email,
    )

    if (user) {
      this.userEmail = user.email

      await this.emailVerificationService.sendVerificationOTP(user.email)
    }
  }

  async verifyOTPForForgotPassword(
    req: CustomRequest<forgotPasswordRequest>,
    forgotPasswordDto: ForgotPasswordDto,
  ) {
    const { newpassword, otp } = forgotPasswordDto

    const verifyOTP: boolean = this.emailVerificationService.verifyOTP(otp)

    if (verifyOTP) {
      const hashPassword: string = await this.hashData(newpassword)

      await req.defaultPrismaClient.user.update({
        where: { email: this.userEmail },
        data: {
          password: hashPassword,
        },
      })

      return new HttpException('Password Changed!', HttpStatus.OK)
    }
  }

  async verifyOTPForLogin(
    req: CustomRequest<loginOTPRequest>,
    loginOTPDto: LoginOTPDto,
  ) {
    const { otp } = loginOTPDto

    const verifyOTP: boolean = this.emailVerificationService.verifyOTP(otp)

    if (verifyOTP) {
      const payload: { email: string } = await this.jwtService.verify(
        this.loginTokens.accessToken,
        {
          secret: this.configService.get('JWT_AT_SECRET'),
        },
      )

      const user: User | null = await this.userService.getUserByEmail(
        req,
        payload.email,
      )

      return {
        user,
        tokens: this.loginTokens,
      }
    }
  }

  async enable2FA(
    req: CustomRequest<commonRequest>,
    enable2FADto: Enable2FADto,
  ) {
    const { email } = enable2FADto

    const user: User | null = await this.userService.getUserByEmail(req, email)

    if (!user?.is2FAEnabled) {
      await req.defaultPrismaClient.user.update({
        where: { email: user?.email },
        data: {
          is2FAEnabled: true,
        },
      })
      throw new HttpException(
        '2 Factor Authentication Is Now Enabled!',
        HttpStatus.OK,
      )
    } else {
      throw new UnauthorizedException(
        '2 Factor Authentication Is Already Enabled!',
      )
    }
  }

  async enableSkip2FA(
    req: CustomRequest<commonRequest>,
    skip2FADto: Skip2FADto,
  ): Promise<User> {
    const { email } = skip2FADto

    const user: User | null = await this.userService.getUserByEmail(req, email)

    if (user?.is2FAEnabled) {
      if (!user.skip2FA) {
        const skip2FAToken: string = this.jwtService.sign(
          { email },
          {
            secret: this.configService.get('JWT_SKIP2FA_TOKEN_SECRET'),
            expiresIn: '5m',
          },
        )

        return await req.defaultPrismaClient.user.update({
          where: { email: user.email },
          data: {
            skip2FA: true,
            skip2FAToken,
          },
        })
      } else {
        throw new UnauthorizedException(
          'Skip 2 Factor Authentication Is Already Enabled!',
        )
      }
    } else {
      throw new UnauthorizedException(
        'Please Enable 2 Factor Authentication First!',
      )
    }
  }

  async checkSkip2FA(
    req: CustomRequest<commonRequest>,
    checkSkip2FADto: CheckSkip2FADto,
  ): Promise<User | undefined> {
    const { email } = checkSkip2FADto

    const user: User | null = await this.userService.getUserByEmail(req, email)

    if (user?.skip2FAToken.length !== 0 && user?.skip2FA === true) {
      try {
        await this.jwtService.verify(user.skip2FAToken, {
          secret: this.configService.get('JWT_SKIP2FA_TOKEN_SECRET'),
        })
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error?.name === 'TokenExpiredError') {
          return await req.defaultPrismaClient.user.update({
            where: { email: user.email },
            data: {
              skip2FA: false,
              skip2FAToken: '',
            },
          })
        }
        throw new BadRequestException('Bad verification token!')
      }
    }
  }
}
