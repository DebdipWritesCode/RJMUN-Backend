import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DayRegistrationDocument = DayRegistration & Document;

@Schema()
export class DayRegistration {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: [Types.ObjectId], ref: 'FestDay', required: true })
  selectedDayIds: Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  selectedActivitiesPerDay?: Record<string, number[]>; // dayId -> activity indices

  @Prop({ unique: true })
  registrationId: string;

  @Prop({ default: 'pending' })
  paymentStatus: 'pending' | 'completed' | 'failed';

  @Prop({ unique: true })
  paymentId: string;

  @Prop()
  couponCode?: string;

  @Prop()
  amountPaid?: number;

  @Prop()
  discountApplied?: number;

  @Prop()
  paymentScreenshotUrl?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const DayRegistrationSchema =
  SchemaFactory.createForClass(DayRegistration);
