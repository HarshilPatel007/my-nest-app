import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocumnet } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocumnet>) {}

  async getUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getUser(_id: string): Promise<User> {
    return this.userModel.findById(_id);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return new this.userModel(createUserDto).save();
  }

  async updateUser(updateUserDto: UpdateUserDto, _id: string): Promise<User> {
    return this.userModel.findByIdAndUpdate({ _id }, updateUserDto);
  }

  async deleteUser(_id: string): Promise<User> {
    return this.userModel.findByIdAndDelete({ _id });
  }
}
