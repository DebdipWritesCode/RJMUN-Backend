import { IsObject } from 'class-validator';

export class UpdateOffersDto {
  @IsObject()
  discounts: Record<string, number>;
}
