import { IsString, IsNumber, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  amountOff: number;

  @IsNumber()
  @Min(1)
  redemptionsLeft: number;
}
