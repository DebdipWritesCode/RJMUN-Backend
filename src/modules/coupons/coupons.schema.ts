import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema()
export class Coupon {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  amountOff: number;

  @Prop({ required: true, default: 1 })
  redemptionsLeft: number;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
