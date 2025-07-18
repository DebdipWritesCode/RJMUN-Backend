import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateRegistrationDto {
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

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsNotEmpty()
  @IsString()
  committeePreference1: string;

  @IsOptional()
  @IsString()
  committeePreference2?: string;

  @IsNotEmpty()
  @IsString()
  portfolioPreference1ForCommitteePreference1: string;

  @IsOptional()
  @IsString()
  portfolioPreference2ForCommitteePreference1?: string;

  @IsNotEmpty()
  @IsString()
  portfolioPreference1ForCommitteePreference2: string;

  @IsOptional()
  @IsString()
  portfolioPreference2ForCommitteePreference2?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Number of MUNs participated must be zero or more' })
  numberOfMUNsParticipated: number;
}
