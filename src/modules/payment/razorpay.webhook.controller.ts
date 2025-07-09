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
import { PaymentService } from './payment.service';
import { RegistrationService } from '../registration/registration.service';
import { Response } from 'express';
import { CreateRegistrationDto } from '../registration/dto/create-registration.dto';
import { EmailService } from '../email/email.service';
import { SheetsService } from '../sheets/sheets.service';

@Controller('razorpay.webhook')
export class RazorpayWebhookController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => RegistrationService))
    private readonly registrationService: RegistrationService,
    private readonly sheetsService: SheetsService,
    private readonly emailService: EmailService,
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
      : this.paymentService.verifySignature(
          JSON.stringify(body),
          signature,
          process.env.RAZORPAY_WEBHOOK_SECRET || '',
        );

    if (!isValid) return res.status(400).json({ message: 'Invalid signature' });

    const { payload } = body;
    const paymentEntity = payload?.payment?.entity;

    if (body.event === 'payment.captured') {
      const metadata: CreateRegistrationDto = paymentEntity?.notes;

      const saved = await this.registrationService.create(metadata);

      const row = [
        saved.registrationId,
        saved.fullName,
        saved.email,
        saved.phone,
        saved.institution,
        saved.committeePreference1,
        saved.committeePreference2 || '',
        saved.portfolioPreference1ForCommitteePreference1,
        saved.portfolioPreference2ForCommitteePreference1 || '',
        saved.portfolioPreference1ForCommitteePreference2,
        saved.portfolioPreference2ForCommitteePreference2 || '',
        new Date().toLocaleString(),
      ];

      await this.sheetsService.appendRegistrationData(
        row,
        process.env.REGISTRATION_SHEET_ID || '',
        "Sheet1!A1"
      )

      await this.emailService.sendRegistrationConfirmation(
        saved.email,
        saved.registrationId,
        saved.fullName,
      );
    }

    return res.json({ message: 'Webhook received' });
  }
}
