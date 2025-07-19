import { IsNotEmpty, IsString } from "class-validator";

export class UpdateAllotmentDto {
  @IsNotEmpty()
  @IsString()
  registrationId: string;

  @IsString()
  allottedCommittee: string;

  @IsString()
  allottedPortfolio: string;
}