import { IsNotEmpty, IsString } from "class-validator";

export class UpdateAllotmentDto {
  @IsNotEmpty()
  @IsString()
  registrationId: string;

  @IsNotEmpty()
  @IsString()
  allottedCommittee: string;

  @IsNotEmpty()
  @IsString()
  allottedPortfolio: string;
}