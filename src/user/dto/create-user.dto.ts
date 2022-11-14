import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'username must be a string' })
  @IsNotEmpty({ message: 'username is required' })
  @MinLength(4, { message: 'username must be 4 characters long' })
  @MaxLength(20, {
    message: "usename shouldn't be more than 20 characters",
  })
  username: string;

  @IsEmail({ message: 'please enter email address' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'please enter password' })
  @MinLength(8, { message: 'password must be 8 characters long' })
  password: string;

  @IsString({ message: 'fullname must be string' })
  @IsNotEmpty({ message: 'please provide your full name' })
  fullname: string;

  @IsNumber()
  @IsNotEmpty({ message: 'please provide your age' })
  // @MaxLength(3)
  age: number;
}
