import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DayRegistrationService } from './day-registration.service';
import { CreateDayRegistrationDto } from './dto/create-day-registration.dto';
import { FestDaysService } from '../admin/fest-days/fest-days.service';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentService } from '../payment/payment.service';
import { SheetsService } from '../sheets/sheets.service';
import { EmailService } from '../email/email.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  getRegistrationPricing,
  isLegacyEarlyBirdCoupon,
  REGISTRATION_PRICES,
} from '../../common/registration-pricing';

@Controller('day-registration')
export class DayRegistrationController {
  constructor(
    private readonly dayRegistrationService: DayRegistrationService,
    private readonly festDaysService: FestDaysService,
    private readonly couponsService: CouponsService,
    private readonly paymentService: PaymentService,
    private readonly sheetsService: SheetsService,
    private readonly emailService: EmailService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private assertCouponIsNotLegacyEarlyBird(couponCode?: string): void {
    if (isLegacyEarlyBirdCoupon(couponCode)) {
      throw new BadRequestException(
        'Early-bird pricing is applied automatically; no code is required.',
      );
    }
  }

  private getFestPricing(dayCount: number, offers: Record<string, number>) {
    const pricing = getRegistrationPricing();
    const sumPrices = pricing.festDayAmount * dayCount;
    const regularSubtotal = REGISTRATION_PRICES.festPerDay.regular * dayCount;
    const percentageOff = offers[String(dayCount)] ?? 0;
    const subtotal = Math.round(sumPrices * (1 - percentageOff / 100));

    return {
      pricing,
      sumPrices,
      regularSubtotal,
      subtotal,
      discountFromEarlyBird: regularSubtotal - sumPrices,
      discountFromMultiDay: sumPrices - subtotal,
    };
  }

  private validateSelectedActivities(
    selectedActivitiesPerDay?: Record<string, number[]>,
  ): void {
    if (!selectedActivitiesPerDay) {
      return;
    }

    for (const [dayId, activityIndices] of Object.entries(
      selectedActivitiesPerDay,
    )) {
      if (!Array.isArray(activityIndices)) {
        throw new BadRequestException(
          `Activities for day ${dayId} must be an array`,
        );
      }

      if (activityIndices.length > 3) {
        throw new BadRequestException(
          `Maximum 3 activities allowed per day. Day ${dayId} has ${activityIndices.length} activities selected`,
        );
      }

      // Validate that all indices are numbers
      if (!activityIndices.every((idx) => typeof idx === 'number')) {
        throw new BadRequestException(
          `Invalid activity indices for day ${dayId}. All indices must be numbers`,
        );
      }
    }
  }

  @Get('days')
  async getDays() {
    const days = await this.festDaysService.findAll();
    const offers = await this.festDaysService.getOffers();
    const pricing = getRegistrationPricing();

    return {
      days: days.map((day) => ({ ...day, price: pricing.festDayAmount })),
      offers,
      pricing: {
        phase: pricing.phase,
        earlyBirdEndsAt: pricing.earlyBirdEndsAt,
        perDayAmount: pricing.festDayAmount,
        regularPerDayAmount: REGISTRATION_PRICES.festPerDay.regular,
      },
    };
  }

  @Post('calculate-amount')
  async calculateAmount(
    @Body()
    body: {
      selectedDayIds: string[];
      couponCode?: string;
      selectedActivitiesPerDay?: Record<string, number[]>;
    },
  ) {
    const { selectedDayIds, couponCode, selectedActivitiesPerDay } = body;

    this.validateSelectedActivities(selectedActivitiesPerDay);

    const dayIds = selectedDayIds || [];
    if (dayIds.length === 0) {
      throw new BadRequestException('Select at least one day');
    }

    const days = await this.festDaysService.findByIds(dayIds);
    if (days.length !== dayIds.length) {
      throw new BadRequestException('One or more selected days are invalid');
    }

    const offers = await this.festDaysService.getOffers();
    const {
      pricing,
      regularSubtotal,
      subtotal,
      discountFromEarlyBird,
      discountFromMultiDay,
    } = this.getFestPricing(dayIds.length, offers);

    let finalAmount = subtotal;
    let discountFromCoupon = 0;
    let couponDetails: { code: string; discountAmount: number } | null = null;

    if (couponCode) {
      this.assertCouponIsNotLegacyEarlyBird(couponCode);
      const coupon = await this.couponsService.findByCode(couponCode);
      if (!coupon) {
        throw new BadRequestException('Invalid coupon code');
      }
      if (coupon.redemptionsLeft <= 0) {
        throw new BadRequestException('Coupon has already been used');
      }
      discountFromCoupon = coupon.amountOff;
      finalAmount = subtotal - discountFromCoupon;
      if (finalAmount < 0) {
        throw new BadRequestException('This coupon is invalid for this order.');
      }
      couponDetails = {
        code: couponCode,
        discountAmount: discountFromCoupon,
      };
    }

    return {
      regularSubtotal,
      subtotal,
      discountFromEarlyBird,
      discountFromMultiDay,
      discountFromCoupon,
      finalAmount,
      coupon: couponDetails,
      currency: 'INR',
      pricingPhase: pricing.phase,
      earlyBirdEndsAt: pricing.earlyBirdEndsAt,
    };
  }

  @Post('initiate')
  async initiate(
    @Body() body: { data: CreateDayRegistrationDto; couponCode?: string },
  ) {
    const { data, couponCode } = body;

    this.validateSelectedActivities(data.selectedActivitiesPerDay);

    const dayIds = data.selectedDayIds || [];
    if (dayIds.length === 0) {
      throw new BadRequestException('Select at least one day');
    }

    const days = await this.festDaysService.findByIds(dayIds);
    if (days.length !== dayIds.length) {
      throw new BadRequestException('One or more selected days are invalid');
    }

    const offers = await this.festDaysService.getOffers();
    const { subtotal } = this.getFestPricing(dayIds.length, offers);

    let finalAmount = subtotal;

    if (couponCode) {
      this.assertCouponIsNotLegacyEarlyBird(couponCode);
      const coupon = await this.couponsService.findByCode(couponCode);
      if (!coupon) {
        throw new BadRequestException('Invalid coupon code');
      }
      if (coupon.redemptionsLeft <= 0) {
        throw new BadRequestException('Coupon has already been used');
      }
      finalAmount = subtotal - coupon.amountOff;
      if (finalAmount < 0) {
        throw new BadRequestException('This coupon is invalid for this order.');
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

      const saved =
        await this.dayRegistrationService.findByPaymentId(fakePaymentId);
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

      // Build days with activities for email
      const daysWithActivities = days.map((day) => {
        const dayId = day._id?.toString();
        const activityIndices = dayId
          ? saved.selectedActivitiesPerDay?.[dayId]
          : undefined;

        const activities =
          activityIndices && activityIndices.length > 0 && day.events
            ? (activityIndices
                .map((idx) => day.events?.[idx]?.title)
                .filter(Boolean) as string[])
            : [];

        return {
          dayName: day.name,
          dayDate: day.date,
          activities,
        };
      });

      await this.emailService.trySendDayRegistrationConfirmation(
        saved.email,
        saved.registrationId,
        saved.firstName,
        selectedDaysSummary,
        daysWithActivities,
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

  @Post('register-with-qr')
  @UseInterceptors(FileInterceptor('paymentScreenshot'))
  async registerWithQr(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('data') dataString: string,
    @Body('couponCode') couponCode?: string,
  ) {
    let data: CreateDayRegistrationDto;
    try {
      data = JSON.parse(dataString);
    } catch {
      throw new BadRequestException('Invalid data format');
    }

    this.validateSelectedActivities(data.selectedActivitiesPerDay);

    const dayIds = data.selectedDayIds || [];
    if (dayIds.length === 0) {
      throw new BadRequestException('Select at least one day');
    }

    const days = await this.festDaysService.findByIds(dayIds);
    if (days.length !== dayIds.length) {
      throw new BadRequestException('One or more selected days are invalid');
    }

    const offers = await this.festDaysService.getOffers();
    const { pricing, subtotal } = this.getFestPricing(dayIds.length, offers);

    let finalAmount = subtotal;

    if (couponCode) {
      this.assertCouponIsNotLegacyEarlyBird(couponCode);
      const coupon = await this.couponsService.findByCode(couponCode);
      if (!coupon) {
        throw new BadRequestException('Invalid coupon code');
      }
      if (coupon.redemptionsLeft <= 0) {
        throw new BadRequestException('Coupon has already been used');
      }
      finalAmount = subtotal - coupon.amountOff;
      if (finalAmount < 0) {
        throw new BadRequestException('This coupon is invalid for this order.');
      }
    }

    const uploaded = file
      ? await this.cloudinaryService.upload(
          file.buffer,
          'rjmun/payment-screenshots',
          file.mimetype,
        )
      : undefined;

    const qrPaymentId = `QR-${Date.now()}`;

    await this.dayRegistrationService.create({
      ...data,
      paymentId: qrPaymentId,
      paymentStatus: 'pending',
      amountPaid: finalAmount,
      discountApplied: subtotal - finalAmount,
      couponCode: couponCode || undefined,
      paymentScreenshotUrl: uploaded?.url,
    });

    if (couponCode) {
      const coupon = await this.couponsService.findByCode(couponCode);
      if (coupon && coupon.redemptionsLeft > 0) {
        await this.couponsService.decrementRedemption(couponCode);
      }
    }

    const saved =
      await this.dayRegistrationService.findByPaymentId(qrPaymentId);
    if (!saved) {
      throw new BadRequestException('Registration not found');
    }

    const row = this.dayRegistrationService.buildSheetRow(
      {
        registrationId: saved.registrationId,
        firstName: saved.firstName,
        lastName: saved.lastName,
        email: saved.email,
        phone: saved.phone,
        paymentStatus: saved.paymentStatus,
        amountPaid: saved.amountPaid,
        createdAt: saved.createdAt,
        paymentScreenshotUrl: uploaded?.url,
        selectedActivitiesPerDay: saved.selectedActivitiesPerDay,
      },
      days,
    );
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

    // Build days with activities for email
    const daysWithActivities = days.map((day) => {
      const dayId = day._id?.toString();
      const activityIndices = dayId
        ? saved.selectedActivitiesPerDay?.[dayId]
        : undefined;

      const activities =
        activityIndices && activityIndices.length > 0 && day.events
          ? (activityIndices
              .map((idx) => day.events?.[idx]?.title)
              .filter(Boolean) as string[])
          : [];

      return {
        dayName: day.name,
        dayDate: day.date,
        activities,
      };
    });

    await this.emailService.trySendDayRegistrationConfirmation(
      saved.email,
      saved.registrationId,
      saved.firstName,
      selectedDaysSummary,
      daysWithActivities,
    );

    return {
      message: 'Registration submitted. Payment verification pending.',
      registrationId: saved.registrationId,
      finalAmount,
      currency: 'INR',
      pricingPhase: pricing.phase,
      paymentScreenshotUrl: uploaded?.url,
    };
  }

  @Get('status/:registrationId')
  async getStatus(@Param('registrationId') registrationId: string) {
    return this.dayRegistrationService.getStatus(registrationId);
  }
}
