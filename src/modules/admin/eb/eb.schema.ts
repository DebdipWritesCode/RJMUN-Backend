import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type EBDocument = EB & Document;

@Schema()
export class EB {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) position: string;
  @Prop({ required: true }) committee: string;
  @Prop() photoUrl: string;
}

export const EBSchema = SchemaFactory.createForClass(EB);