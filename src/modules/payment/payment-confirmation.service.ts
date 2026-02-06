import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RegistrationService } from '../registration/registration.service';
import { RegistrationDocument } from '../registration/registration.schema';
import { CreateRegistrationDto } from '../registration/dto/create-registration.dto';
import { CouponsService } from '../coupons/coupons.service';
import { SheetsService } from '../sheets/sheets.service';
import { EmailService } from '../email/email.service';

export const ALREADY_PROCESSED_ERROR = 'already-processed';

@Injectable()
export class PaymentConfirmationService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject(forwardRef(() => RegistrationService))
    private readonly registrationService: RegistrationService,
    private readonly couponsService: CouponsService,
    private readonly sheetsService: SheetsService,
    private readonly emailService: EmailService,
  ) {}

  async processCapturedPayment(
    paymentId: string,
    notes: Record<string, any>,
  ): Promise<RegistrationDocument> {
    const metadata = notes as Record<string, any> & { couponCode?: string };
    const { couponCode, ...registrationFields } = metadata;
    const createDto: CreateRegistrationDto = {
      ...registrationFields,
      paymentId,
      paymentStatus: 'completed',
    } as CreateRegistrationDto;

    const session = await this.connection.startSession();
    let saved: RegistrationDocument | null = null;

    try {
      await session.withTransaction(async () => {
        const existing = await this.registrationService.findByPaymentId(
          paymentId,
          session,
        );

        if (existing) {
          console.log(`Payment ${paymentId} already processed.`);
          throw new Error(ALREADY_PROCESSED_ERROR);
        }

        saved = await this.registrationService.create(createDto, session);

        if (couponCode) {
          const coupon = await this.couponsService.findByCode(
            couponCode,
            session,
          );
          if (coupon && coupon.redemptionsLeft > 0) {
            await this.couponsService.decrementRedemption(couponCode, session);
          }
        }
      });

      if (!saved) {
        throw new Error('Unexpected: registration was not saved');
      }

      const registration = saved as RegistrationDocument;

      const row = [
        registration.registrationId,
        registration.fullName,
        registration.email,
        registration.phone,
        registration.institution,
        registration.numberOfMUNsParticipated,
        registration.committeePreference1,
        registration.committeePreference2 || '',
        registration.portfolioPreference1ForCommitteePreference1,
        registration.portfolioPreference2ForCommitteePreference1 || '',
        registration.portfolioPreference1ForCommitteePreference2,
        registration.portfolioPreference2ForCommitteePreference2 || '',
        registration.paymentStatus,
        new Date().toLocaleString(),
      ];

      await this.sheetsService.appendRegistrationData(
        row,
        process.env.REGISTRATION_SHEET_ID || '',
        'Sheet1!A1',
      );

      await this.emailService.sendRegistrationConfirmation(
        registration.email,
        registration.registrationId,
        registration.fullName,
      );

      return registration;
    } finally {
      await session.endSession();
    }
  }
}
