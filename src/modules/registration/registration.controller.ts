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
import { UpdateAllotmentDto } from './dto/update-allotment';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentService } from '../payment/payment.service';

@Controller('registration')
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly couponsService: CouponsService,
    private readonly paymentService: PaymentService,
  ) {}

  private readonly BASE_AMOUNT = 1000;

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

  @Get('status/:registrationId')
  async checkStatus(@Param('registrationId') id: string) {
    return this.registrationService.getStatus(id);
  }

  @Patch('allot')
  async allot(@Body() dto: UpdateAllotmentDto) {
    return this.registrationService.updateAllotment(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.registrationService.delete(id);
  }
}
