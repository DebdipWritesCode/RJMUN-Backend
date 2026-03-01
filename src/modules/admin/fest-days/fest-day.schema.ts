import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FestDayDocument = FestDay & Document;

@Schema({ _id: false })
export class FestDayEvent {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;
}

export const FestDayEventSchema = SchemaFactory.createForClass(FestDayEvent);

@Schema()
export class FestDay {
  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  imagePublicId?: string;

  @Prop({ type: [FestDayEventSchema], default: [] })
  events: FestDayEvent[];
}

export const FestDaySchema = SchemaFactory.createForClass(FestDay);
