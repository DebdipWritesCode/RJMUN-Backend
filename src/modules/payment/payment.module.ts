import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { RazorpayWebhookController } from './razorpay.webhook.controller';
import { RegistrationModule } from '../registration/registration.module';

@Module({
  imports: [forwardRef(() => RegistrationModule)],
  controllers: [PaymentController, RazorpayWebhookController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
