import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentConfirmationService } from './payment-confirmation.service';
import { RazorpayWebhookController } from './razorpay.webhook.controller';
import { RegistrationModule } from '../registration/registration.module';
import { DayRegistrationModule } from '../day-registration/day-registration.module';
import { FestDaysModule } from '../admin/fest-days/fest-days.module';
import { SheetsModule } from '../sheets/sheets.module';
import { EmailModule } from '../email/email.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    forwardRef(() => RegistrationModule),
    forwardRef(() => DayRegistrationModule),
    FestDaysModule,
    EmailModule,
    SheetsModule,
    CouponsModule,
  ],
  controllers: [PaymentController, RazorpayWebhookController],
  providers: [PaymentService, PaymentConfirmationService],
  exports: [PaymentService],
})
export class PaymentModule {}
