import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FestDayDocument = FestDay & Document;

@Schema()
export class FestDay {
  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  events: string[];

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop()
  imageUrl?: string;

  @Prop()
  imagePublicId?: string;
}

export const FestDaySchema = SchemaFactory.createForClass(FestDay);
