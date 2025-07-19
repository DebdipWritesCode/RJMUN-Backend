import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateTeamMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsNotEmpty()
  type: 'super' | 'head' | 'manager';

  @IsOptional()
  @IsString()
  @IsUrl()
  photoUrl?: string;
}
