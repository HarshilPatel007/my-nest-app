import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  loggedInUserId = '';

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
    return this.userModel.find().exec();
  }

  async getUser(_id: string): Promise<User> {
    if (_id === this.loggedInUserId) {
      return this.userModel.findById(_id);
    } else {
      throw new UnauthorizedException('User ID not matched!');
    }
  }

  async getLoggedInUser(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }

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

  async updateUser(updateUserDto: UpdateUserDto, _id: string): Promise<User> {
    if (_id === this.loggedInUserId) {
      return this.userModel.findByIdAndUpdate({ _id }, updateUserDto);
    } else {
      throw new UnauthorizedException('User ID not matched!');
    }
  }

  async deleteUser(_id: string): Promise<User> {
    if (_id === this.loggedInUserId) {
      return this.userModel.findByIdAndDelete({ _id });
    } else {
      throw new UnauthorizedException('User ID not matched!');
    }
  }

  async loginUser(authDto: AuthDto): Promise<Tokens> {
    const user = await this.userModel.findOne({
      email: authDto.email,
    });

    if (!user)
      throw new UnauthorizedException('Access Denided! User not found!');

    const passwordMatches = await bcrypt.compare(
      authDto.password,
      user.password,
    );
    if (!passwordMatches)
      throw new UnauthorizedException('Access Denided! Password is incorrect!');
    this.loggedInUserId = user.id;
    const tokens = await this.getTokens(user.username, user.email);
    return tokens;
  }
}
