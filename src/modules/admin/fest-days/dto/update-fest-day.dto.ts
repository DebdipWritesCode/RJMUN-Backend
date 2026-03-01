import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UpdateFestDayEventDto } from './update-fest-day-event.dto';

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFestDayEventDto)
  events?: UpdateFestDayEventDto[]; // Can be string (JSON) or array - service handles parsing
}
