import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentService } from '../payment/payment.service';
import { BulkUpdateAllotmentDto } from './dto/bulk-update-allotment.dto';
import { EmailService } from '../email/email.service';
import { SheetsService } from '../sheets/sheets.service';

@Controller('registration')
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly couponsService: CouponsService,
    private readonly paymentService: PaymentService,
    private readonly sheetsService: SheetsService,
    private readonly emailService: EmailService,
  ) {}

  private readonly BASE_AMOUNT = 1200;

  @Post('initiate')
  async initiateRegistration(
    @Body() body: { data: CreateRegistrationDto; couponCode?: string },
  ) {
    const { data, couponCode } = body;

    let finalAmount = this.BASE_AMOUNT;

    if (couponCode) {
      const coupon = await this.couponsService.findByCode(couponCode);

      if (!coupon) {
        throw new BadRequestException('Invalid coupon code');
      }

      if (coupon.redemptionsLeft <= 0) {
        throw new BadRequestException('Coupon has already been used');
      }

      if (coupon.amountOff > this.BASE_AMOUNT) {
        throw new BadRequestException(
          'Coupon discount exceeds the base amount',
        );
      }

      finalAmount -= coupon.amountOff;
    }

    const metadata = {
      ...data,
      couponCode: couponCode || null,
    };

    if (finalAmount <= 0) {
      const fakePaymentId = `FREE-${Date.now()}`;

      await this.registrationService.create({
        ...metadata,
        paymentId: fakePaymentId,
        paymentStatus: 'completed',
      });

      if (couponCode) {
        const coupon = await this.couponsService.findByCode(couponCode);
        if (coupon && coupon.redemptionsLeft > 0) {
          await this.couponsService.decrementRedemption(couponCode);
        }
      }

      const saved = await this.registrationService.findByPaymentId(fakePaymentId);
      if (!saved) {
        throw new BadRequestException('Registration not found');
      }
      
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

  @Post()
  async register(@Body() dto: CreateRegistrationDto) {
    return this.registrationService.create(dto);
  }

  @Get('registrants')
  async getRegistrants() {
    return this.registrationService.getAllRegistrants();
  }

  @Get('status/:registrationId')
  async checkStatus(@Param('registrationId') id: string) {
    return this.registrationService.getStatus(id);
  }

  @Patch('allot')
  async allot(@Body() dto: BulkUpdateAllotmentDto) {
    return this.registrationService.bulkUpdateAllotments(dto.allotments);
  }

  @Post('send-allotment-emails')
  async sendAllotmentEmails() {
    return this.registrationService.sendAllotmentEmails();
  }

  @Post('update-allotments-sheets')
  async updateAllotmentsSheets() {
    return this.registrationService.updateAllotmentsSheets();
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.registrationService.delete(id);
  }
}
