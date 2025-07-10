import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateSponsorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['partner', 'college', 'endorsement'])
  type: 'partner' | 'college' | 'endorsement';

  @IsString()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
