import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SponsorDocument = Sponsor & Document;

export type SponsorType = 'partner' | 'college' | 'endorsement';

@Schema()
export class Sponsor {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, enum: ['partner', 'college', 'endorsement'] })
  type: SponsorType;
  @Prop({ type: Buffer }) image: Buffer;
  @Prop() imageMimeType: string;
}

export const SponsorSchema = SchemaFactory.createForClass(Sponsor);
