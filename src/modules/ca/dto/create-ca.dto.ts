import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateCADto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  institution: string;

  @IsNotEmpty()
  @IsString()
  whyJoin: string;

  @IsNotEmpty()
  @IsString()
  experience: string;
}
