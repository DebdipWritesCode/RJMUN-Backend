import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import { razorpayConfig } from 'src/config/razorpay.config';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: razorpayConfig.key_id,
      key_secret: razorpayConfig.key_secret,
    })
  }

  async createOrder(amount: number) {
    const order = await this.razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      payment_capture: true,
    })

    return order;
  }

  verifySignature(body: any, signature: string, secret: string) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }
}
