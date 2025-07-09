import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCommitteeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  agenda: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  backgroundGuideURL?: string;
}
