import {
  BadRequestException,
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentConfirmationService } from './payment-confirmation.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { ALREADY_PROCESSED_ERROR } from './payment-confirmation.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentConfirmationService: PaymentConfirmationService,
  ) {}

  @Post('order')
  async createOrder(@Body() body: { amount: number }) {
    return this.paymentService.createOrder(body.amount);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.CREATED)
  async confirmPayment(@Body() body: ConfirmPaymentDto) {
    const { orderId, paymentId, signature } = body;

    const isValid = this.paymentService.verifyPaymentSuccess(
      orderId,
      paymentId,
      signature,
    );
    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    let payment: { status: string; notes?: Record<string, any> };
    try {
      payment = await this.paymentService.fetchPayment(paymentId);
    } catch {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status !== 'captured') {
      throw new BadRequestException('Payment not captured');
    }

    try {
      const saved = await this.paymentConfirmationService.processCapturedPayment(
        paymentId,
        payment.notes || {},
      );
      const fullName =
        'fullName' in saved && saved.fullName
          ? saved.fullName
          : `${(saved as any).firstName || ''} ${(saved as any).lastName || ''}`.trim();
      return {
        message: 'Payment confirmed and registration created',
        registrationId: saved.registrationId,
        fullName,
        email: saved.email,
      };
    } catch (err) {
      if (err.message === ALREADY_PROCESSED_ERROR) {
        return {
          message: 'Payment already processed',
          registrationId: null,
        };
      }
      throw err;
    }
  }
}
