import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocumnet = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  fullname: string;
  @Prop({ required: true })
  age: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
