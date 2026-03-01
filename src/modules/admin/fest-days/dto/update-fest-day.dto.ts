import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateFestDayDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (value == null || value === '') return undefined;
    return typeof value === 'string' ? Number(value) : value;
  })
  price?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value == null ? undefined : String(value).trim(),
  )
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @IsOptional()
  events?: any; // Can be string (JSON) or array - service handles parsing
}
