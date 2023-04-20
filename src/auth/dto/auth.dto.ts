import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsEmail({ message: 'please enter email address' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'please enter password' })
  password: string;
}
