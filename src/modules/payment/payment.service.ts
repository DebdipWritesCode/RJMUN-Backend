import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');

@Injectable()
export class PaymentService {
  private razorpay: any;

  constructor(private configService: ConfigService) {
    const key_id = this.configService.get<string>('RAZORPAY_KEY_ID');
    const key_secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!key_id || !key_secret) {
      throw new Error('Razorpay credentials are not set in environment variables');
    }

    this.razorpay = new Razorpay({ key_id, key_secret });
  }

  async createOrder(amount: number, metadata?: any) {
    const order = await this.razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      payment_capture: true,
      notes: metadata || {},
    });

    return order;
  }

  verifySignature(body: any, signature: string) {
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET')!;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  verifyPaymentSuccess(orderId: string, paymentId: string, signature: string): boolean {
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET')!;
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return expectedSignature === signature;
  }

  async fetchPayment(paymentId: string) {
    return this.razorpay.payments.fetch(paymentId);
  }
}
