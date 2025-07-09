import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('order')
  async createOrder(@Body() body: { amount: number }) {
    return this.paymentService.createOrder(body.amount);
  }
}
