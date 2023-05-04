import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail({ message: 'please enter email address' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'please enter password' })
  password: string;
}

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

export class ForgotPasswordDto {
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'please enter password' })
  @MinLength(8, { message: 'password must be 8 characters long' })
  newpassword: string;

  @IsNotEmpty({ message: 'please enter OTP' })
  otp: string;
}

export class LoginOTPDto {
  @IsNotEmpty({ message: 'please enter OTP' })
  otp: string;
}
