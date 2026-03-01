import {
  IsString,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateFestDayEventDto {
  @IsOptional()
  @IsString()
  title?: string;

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
}
