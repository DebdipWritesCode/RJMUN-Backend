import {
  Body,
  Controller,
  forwardRef,
  Headers,
  HttpCode,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { RegistrationService } from '../registration/registration.service';
import { EmailService } from '../email/email.service';
import { SheetsService } from '../sheets/sheets.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateRegistrationDto } from '../registration/dto/create-registration.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('razorpay.webhook')
export class RazorpayWebhookController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => RegistrationService))
    private readonly registrationService: RegistrationService,
    private readonly sheetsService: SheetsService,
    private readonly emailService: EmailService,
    private readonly couponsService: CouponsService,
    @InjectConnection() private readonly connection: Connection,
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
      const metadata: CreateRegistrationDto & { couponCode?: string } =
        paymentEntity?.notes;
      const couponCode = metadata?.couponCode;

      const session = await this.connection.startSession();
      let saved: any = null;

      try {
        await session.withTransaction(async () => {
          const existing = await this.registrationService.findByPaymentId(paymentId, session);

          if (existing) {
            console.log(`Payment ${paymentId} already processed.`);
            throw new Error('already-processed');
          }

          saved = await this.registrationService.create(
            {
              ...metadata,
              paymentId,
              paymentStatus: 'completed',
            },
            session,
          );

          if (couponCode) {
            const coupon = await this.couponsService.findByCode(couponCode, session);
            if (coupon && coupon.redemptionsLeft > 0) {
              await this.couponsService.decrementRedemption(couponCode, session);
            }
          }
        });

        if (saved) {
          const row = [
            saved.registrationId,
            saved.fullName,
            saved.email,
            saved.phone,
            saved.institution,
            saved.numberOfMUNsParticipated,
            saved.committeePreference1,
            saved.committeePreference2 || '',
            saved.portfolioPreference1ForCommitteePreference1,
            saved.portfolioPreference2ForCommitteePreference1 || '',
            saved.portfolioPreference1ForCommitteePreference2,
            saved.portfolioPreference2ForCommitteePreference2 || '',
            saved.paymentStatus,
            new Date().toLocaleString(),
          ];

          await this.sheetsService.appendRegistrationData(
            row,
            process.env.REGISTRATION_SHEET_ID || '',
            'Sheet1!A1',
          );

          await this.emailService.sendRegistrationConfirmation(
            saved.email,
            saved.registrationId,
            saved.fullName,
          );
        }

        return res.json({ message: 'Webhook processed successfully' });

      } catch (err) {
        if (err.message === 'already-processed') {
          return res.json({ message: 'Payment already processed' });
        }

        console.error('Transaction failed:', err);
        return res.status(500).json({ message: 'Internal error during processing' });
      } finally {
        await session.endSession();
      }
    }

    return res.json({ message: 'Webhook received' });
  }
}