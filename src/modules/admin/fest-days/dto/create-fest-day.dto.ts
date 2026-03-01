import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateFestDayEventDto } from './create-fest-day-event.dto';

export class CreateFestDayDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  price: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value == null || value === '' ? undefined : String(value).trim(),
  )
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFestDayEventDto)
  events?: CreateFestDayEventDto[]; // Can be string (JSON) or array - service handles parsing
}
