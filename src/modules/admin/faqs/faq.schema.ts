import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FAQDocument = FAQ & Document;

@Schema()
export class FAQ {
  @Prop({ required: true }) question: string;
  @Prop({ required: true }) answer: string;
}

export const FAQSchema = SchemaFactory.createForClass(FAQ);
