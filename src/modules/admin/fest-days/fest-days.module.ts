import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FestDaysService } from './fest-days.service';
import { FestDaysController } from './fest-days.controller';
import { FestDay, FestDaySchema } from './fest-day.schema';
import { FestOffer, FestOfferSchema } from './fest-offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FestDay.name, schema: FestDaySchema },
      { name: FestOffer.name, schema: FestOfferSchema },
    ]),
  ],
  controllers: [FestDaysController],
  providers: [FestDaysService],
  exports: [FestDaysService],
})
export class FestDaysModule {}
