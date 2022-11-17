import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocumnet } from './schemas/user.schema';
import { Tokens } from './types/tokens.types';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocumnet>,
    private jwtService: JwtService,
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

  async getUsers(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async getUser(_id: string): Promise<User> {
    return await this.userModel.findById(_id);
  }

  // main use case to get the user from email address.
  // being used to get the loggedIn user as well.
  async getUserByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }

  async getUserByUsername(username: string): Promise<User> {
    return await this.userModel.findOne({ username }).exec();
  }

  async createUser(createUserDto: CreateUserDto): Promise<Tokens> {
    const { username, email, password, fullname, age } = createUserDto;
    const hash = await this.hashData(password);
    const newUser = await this.userModel.create({
      email,
      username,
      password: hash,
      age,
      fullname,
    });
    const tokens = await this.getTokens(newUser.username, newUser.email);
    return tokens;
  }

  // async updateRtHash(username: string, rt: string) {
  //   const hash = await this.hashData(rt);
  //   const user = await this.userModel.where({ username: username });

  // }

  // user can not change password and username
  // will do that with another route. ie: /user/password/change/
  async updateUser(updateUserDto: UpdateUserDto, _id: string): Promise<User> {
    const { email, fullname, age } = updateUserDto;
    return await this.userModel.findByIdAndUpdate(
      { _id },
      { email, age, fullname },
    );
  }

  async deleteUser(_id: string): Promise<User> {
    return await this.userModel.findByIdAndDelete({ _id });
  }

  async loginUser(authDto: AuthDto): Promise<Tokens> {
    const user = await this.userModel.findOne({
      email: authDto.email,
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
    const user = await this.userModel.findById(req.user._id);
    const check_passwd = await bcrypt.compare(password, user.password);
    if (check_passwd) {
      const hash = await this.hashData(newpassword);
      await this.userModel.findByIdAndUpdate(req.user._id, {
        password: hash,
      });
      return new HttpException('Password Changed!', HttpStatus.OK);
    } else {
      throw new ForbiddenException('old password is incorrect!');
    }
  }
}
