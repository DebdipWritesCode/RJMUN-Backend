import { IsNotEmpty, IsString } from 'class-validator';

export class CheckStatusDto {
  @IsNotEmpty()
  @IsString()
  registrationId: string;
}
