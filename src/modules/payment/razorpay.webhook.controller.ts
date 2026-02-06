import { Body, Controller, Headers, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import {
  PaymentConfirmationService,
  ALREADY_PROCESSED_ERROR,
} from './payment-confirmation.service';

@Controller('razorpay.webhook')
export class RazorpayWebhookController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentConfirmationService: PaymentConfirmationService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async razorpayWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
    @Res() res: Response,
  ) {
    const isDev = process.env.NODE_ENV === 'development';

    const isValid = isDev
      ? true
      : this.paymentService.verifySignature(JSON.stringify(body), signature);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const { payload } = body;
    const paymentEntity = payload?.payment?.entity;
    const paymentId = paymentEntity?.id;

    if (body.event === 'payment.captured') {
      try {
        await this.paymentConfirmationService.processCapturedPayment(
          paymentId,
          paymentEntity?.notes || {},
        );
        return res.json({ message: 'Webhook processed successfully' });
      } catch (err) {
        if (err.message === ALREADY_PROCESSED_ERROR) {
          return res.json({ message: 'Payment already processed' });
        }
        console.error('Transaction failed:', err);
        return res
          .status(500)
          .json({ message: 'Internal error during processing' });
      }
    }

    return res.json({ message: 'Webhook received' });
  }
}