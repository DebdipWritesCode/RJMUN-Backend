import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ArrayMinSize,
  IsObject,
} from 'class-validator';
import { IsMongoId } from 'class-validator';

export class CreateDayRegistrationDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
  phone: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Select at least one day' })
  @IsMongoId({ each: true })
  selectedDayIds: string[];

  @IsOptional()
  @IsObject()
  selectedActivitiesPerDay?: Record<string, number[]>; // dayId -> activity indices

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  amountPaid?: number;

  @IsOptional()
  discountApplied?: number;

  @IsOptional()
  @IsString()
  paymentScreenshotUrl?: string;
}
