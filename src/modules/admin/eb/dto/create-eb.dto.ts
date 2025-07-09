import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateEbDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsNotEmpty()
  committee: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  photoUrl?: string;
}
