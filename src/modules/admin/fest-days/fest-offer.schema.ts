import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FestOfferDocument = FestOffer & Document;

@Schema()
export class FestOffer {
  @Prop({ type: Map, of: Number, default: {} })
  discounts: Map<string, number>;
}

export const FestOfferSchema = SchemaFactory.createForClass(FestOffer);
