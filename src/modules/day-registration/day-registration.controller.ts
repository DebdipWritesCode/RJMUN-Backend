import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { DayRegistrationService } from './day-registration.service';
import { CreateDayRegistrationDto } from './dto/create-day-registration.dto';
import { FestDaysService } from '../admin/fest-days/fest-days.service';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentService } from '../payment/payment.service';
import { SheetsService } from '../sheets/sheets.service';
import { EmailService } from '../email/email.service';

@Controller('day-registration')
export class DayRegistrationController {
  constructor(
    private readonly dayRegistrationService: DayRegistrationService,
    private readonly festDaysService: FestDaysService,
    private readonly couponsService: CouponsService,
    private readonly paymentService: PaymentService,
    private readonly sheetsService: SheetsService,
    private readonly emailService: EmailService,
  ) {}

  @Get('days')
  async getDays() {
    const days = await this.festDaysService.findAll();
    const offers = await this.festDaysService.getOffers();
    return { days, offers };
  }

  @Post('initiate')
  async initiate(
    @Body() body: { data: CreateDayRegistrationDto; couponCode?: string },
  ) {
    const { data, couponCode } = body;

    const dayIds = data.selectedDayIds || [];
    if (dayIds.length === 0) {
      throw new BadRequestException('Select at least one day');
    }

    const days = await this.festDaysService.findByIds(dayIds);
    if (days.length !== dayIds.length) {
      throw new BadRequestException('One or more selected days are invalid');
    }

    const sumPrices = days.reduce((s, d) => s + d.price, 0);
    const offers = await this.festDaysService.getOffers();
    const percentageOff = offers[String(dayIds.length)] ?? 0;
    const subtotal = Math.round(sumPrices * (1 - percentageOff / 100));

    let finalAmount = subtotal;

    if (couponCode) {
      const coupon = await this.couponsService.findByCode(couponCode);
      if (!coupon) {
        throw new BadRequestException('Invalid coupon code');
      }
      if (coupon.redemptionsLeft <= 0) {
        throw new BadRequestException('Coupon has already been used');
      }
      finalAmount = subtotal - coupon.amountOff;
      if (finalAmount < 0) {
        throw new BadRequestException(
          'This coupon is invalid for this order.',
        );
      }
    }

    const metadata = {
      type: 'day_registration',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      selectedDayIds: data.selectedDayIds,
      couponCode: couponCode || null,
      amountPaid: finalAmount,
      discountApplied: subtotal - finalAmount,
    };

    if (finalAmount <= 0) {
      const fakePaymentId = `FREE-${Date.now()}`;
      await this.dayRegistrationService.create({
        ...data,
        paymentId: fakePaymentId,
        paymentStatus: 'completed',
        amountPaid: 0,
        discountApplied: subtotal,
      });

      if (couponCode) {
        const coupon = await this.couponsService.findByCode(couponCode);
        if (coupon && coupon.redemptionsLeft > 0) {
          await this.couponsService.decrementRedemption(couponCode);
        }
      }

      const saved = await this.dayRegistrationService.findByPaymentId(
        fakePaymentId,
      );
      if (!saved) {
        throw new BadRequestException('Registration not found');
      }

      const row = this.dayRegistrationService.buildSheetRow(saved, days);
      const sheetId = process.env.DAY_REGISTRATION_SHEET_ID || '';
      if (sheetId) {
        await this.sheetsService.appendRegistrationData(
          row,
          sheetId,
          'Sheet1!A1',
        );
      }

      const selectedDaysSummary = days
        .map((d) => `${d.name} (${d.date})`)
        .join(', ');
      await this.emailService.sendDayRegistrationConfirmation(
        saved.email,
        saved.registrationId,
        saved.firstName,
        selectedDaysSummary,
      );

      return {
        message: 'Registration completed without payment',
        registrationId: saved.registrationId,
        finalAmount: 0,
        currency: 'INR',
      };
    }

    const order = await this.paymentService.createOrder(finalAmount, metadata);
    return {
      order,
      finalAmount,
      currency: 'INR',
    };
  }

  @Get('status/:registrationId')
  async getStatus(@Param('registrationId') registrationId: string) {
    return this.dayRegistrationService.getStatus(registrationId);
  }
}
