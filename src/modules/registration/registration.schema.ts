import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RegistrationDocument = Registration & Document;

@Schema()
export class Registration {
  @Prop({ required: true }) fullName: string;
  @Prop({ required: true }) email: string;
  @Prop({ required: true }) phone: string;
  @Prop({ required: true }) institution: string;
  @Prop({ required: true, min: 0 })
  numberOfMUNsParticipated: number;

  @Prop({ required: true }) committeePreference1: string;
  @Prop() committeePreference2: string;
  @Prop({ required: true }) portfolioPreference1ForCommitteePreference1: string;
  @Prop() portfolioPreference2ForCommitteePreference1: string;
  @Prop({ required: true }) portfolioPreference1ForCommitteePreference2: string;
  @Prop() portfolioPreference2ForCommitteePreference2: string;

  @Prop() registrationId: string;
  @Prop({ default: 'pending' }) paymentStatus:
    | 'pending'
    | 'completed'
    | 'failed';
  @Prop() paymentId: string;

  @Prop({ default: 'not_allotted' }) allotmentStatus:
    | 'not_allotted'
    | 'allotted';
  @Prop() allottedCommittee?: string;
  @Prop() allottedPortfolio?: string;
  @Prop() couponCode?: string;

  @Prop({ default: Date.now }) createdAt: Date;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);
