import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateSponsorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['partner', 'college', 'endorsement'])
  type: 'partner' | 'college' | 'endorsement';

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;
}
