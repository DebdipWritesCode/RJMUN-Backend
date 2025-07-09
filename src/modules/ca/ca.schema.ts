import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CARegistrationDocument = CARegistration & Document;

@Schema()
export class CARegistration {
  @Prop({ required: true }) fullName: string;
  @Prop({ required: true }) email: string;
  @Prop({ required: true }) phone: string;
  @Prop() institution: string;
  @Prop() whyJoin: string;
  @Prop() experience: string;

  @Prop({ default: Date.now }) createdAt: Date;
}

export const CARegistrationSchema = SchemaFactory.createForClass(CARegistration);
