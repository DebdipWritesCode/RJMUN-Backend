import { IsString, IsNumber, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  amount_off: number;
}
