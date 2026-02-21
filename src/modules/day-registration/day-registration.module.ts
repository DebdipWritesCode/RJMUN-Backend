import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DayRegistration,
  DayRegistrationSchema,
} from './day-registration.schema';
import { DayRegistrationService } from './day-registration.service';
import { DayRegistrationController } from './day-registration.controller';
import { FestDaysModule } from '../admin/fest-days/fest-days.module';
import { CouponsModule } from '../coupons/coupons.module';
import { PaymentModule } from '../payment/payment.module';
import { EmailModule } from '../email/email.module';
import { SheetsModule } from '../sheets/sheets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DayRegistration.name, schema: DayRegistrationSchema },
    ]),
    FestDaysModule,
    forwardRef(() => PaymentModule),
    CouponsModule,
    EmailModule,
    SheetsModule,
  ],
  controllers: [DayRegistrationController],
  providers: [DayRegistrationService],
  exports: [DayRegistrationService],
})
export class DayRegistrationModule {}
