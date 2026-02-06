import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommitteeDocument = Committee & Document;

@Schema()
export class Committee {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) agenda: string;
  @Prop() backgroundGuideURL: string;
  @Prop() imageUrl?: string;
  @Prop() imagePublicId?: string;
  @Prop({ type: [String], required: false }) portfolios?: string[];
}

export const CommitteeSchema = SchemaFactory.createForClass(Committee);
