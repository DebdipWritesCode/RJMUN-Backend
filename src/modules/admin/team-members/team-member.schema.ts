import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamMemberDocument = TeamMember & Document;

@Schema()
export class TeamMember {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) position: string;
  @Prop({ type: Buffer }) image: Buffer;
  @Prop() imageMimeType: string;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
