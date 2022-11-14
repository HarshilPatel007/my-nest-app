import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AuthDto } from './dto/auth.dto';
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
        { sub: username, email },
        { secret: 'at-secret', expiresIn: 60 * 30 }, // 30 minutes
      ),
      this.jwtService.signAsync(
        { sub: username, email },
        { secret: 'rt-secret', expiresIn: 60 * 60 * 24 * 7 }, // one week
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async getUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getUser(_id: string): Promise<User> {
    return this.userModel.findById(_id);
  }

  async createUser(createUserDto: CreateUserDto): Promise<Tokens> {
    const { username, email, password, fullname, age } = createUserDto;
    const username_exist = await this.userModel.findOne({ username });
    const email_exist = await this.userModel.findOne({ email });
    if (username_exist) {
      throw new HttpException('Username already taken!', HttpStatus.CONFLICT);
    } else if (email_exist) {
      throw new HttpException(
        `User with the ${email} already exist!`,
        HttpStatus.CONFLICT,
      );
    } else {
      // return new this.userModel(createUserDto).save();
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
  }

  // async updateRtHash(username: string, rt: string) {
  //   const hash = await this.hashData(rt);
  //   const user = await this.userModel.where({ username: username });

  // }

  async updateUser(updateUserDto: UpdateUserDto, _id: string): Promise<User> {
    return this.userModel.findByIdAndUpdate({ _id }, updateUserDto);
  }

  async deleteUser(_id: string): Promise<User> {
    return this.userModel.findByIdAndDelete({ _id });
  }

  async loginUser(authDto: AuthDto): Promise<Tokens> {
    const user: User[] = await this.userModel.where({
      email: authDto.email,
    });

    if (!user) throw new ForbiddenException('Access Denided! User not found!');

    console.log(user[0]);
    const passwordMatches = await bcrypt.compare(
      authDto.password,
      user[0].password,
    );
    if (!passwordMatches)
      throw new ForbiddenException('Access Denided! Password not matched!');
    const tokens = await this.getTokens(user[0].username, user[0].email);
    return tokens;
  }
}
