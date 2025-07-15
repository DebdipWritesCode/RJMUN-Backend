import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { RazorpayWebhookController } from './razorpay.webhook.controller';
import { RegistrationModule } from '../registration/registration.module';
import { SheetsModule } from '../sheets/sheets.module';
import { EmailModule } from '../email/email.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    forwardRef(() => RegistrationModule),
    EmailModule,
    SheetsModule,
    CouponsModule,
  ],
  controllers: [PaymentController, RazorpayWebhookController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
