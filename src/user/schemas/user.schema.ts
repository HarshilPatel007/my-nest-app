import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocumnet = User & Document;

@Schema()
export class User {
  @Prop()
  userId: string;
  @Prop()
  name: string;
  @Prop()
  age: number;
  @Prop()
  email: string;
  @Prop()
  isActive: boolean;
  @Prop()
  isPaid: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
