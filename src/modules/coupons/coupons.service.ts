import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Coupon, CouponDocument } from './coupons.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    return this.couponModel.create(createCouponDto);
  }

  async findAll(): Promise<Coupon[]> {
    return this.couponModel.find().exec();
  }

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async findByCode(code: string, session?: ClientSession): Promise<Coupon> {
    const query = this.couponModel.findOne({ code });

    if (session) {
      query.session(session);
    }

    const coupon = await query.exec();

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const updated = await this.couponModel
      .findByIdAndUpdate(id, updateCouponDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Coupon not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.couponModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Coupon not found');
  }

  async decrementRedemption(code: string, session?: ClientSession) {
    const query = this.couponModel.findOneAndUpdate(
      { code },
      { $inc: { redemptionsLeft: -1 } },
      { new: true },
    );

    if (session) {
      query.session(session);
    }

    await query.exec();
  }
}
