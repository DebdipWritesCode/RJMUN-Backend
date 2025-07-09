import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EB, EBSchema } from './eb.schema';
import { EbController } from './eb.controller';
import { EbService } from './eb.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: EB.name, schema: EBSchema }])],
  controllers: [EbController],
  providers: [EbService],
})
export class EbModule {}
