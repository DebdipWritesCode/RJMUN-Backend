import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Registration, RegistrationSchema } from './registration.schema';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { PaymentModule } from '../payment/payment.module';
import { CouponsModule } from '../coupons/coupons.module';
import { EmailModule } from '../email/email.module';
import { SheetsModule } from '../sheets/sheets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
    ]),
    forwardRef(() => PaymentModule),
    CouponsModule,
    EmailModule,
    SheetsModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
