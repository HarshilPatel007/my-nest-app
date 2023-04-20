import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'please enter password' })
  @MinLength(8, { message: 'password must be 8 characters long' })
  password: string;

  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'please enter password' })
  @MinLength(8, { message: 'password must be 8 characters long' })
  newpassword: string;
}
