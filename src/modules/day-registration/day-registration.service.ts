import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DayRegistration,
  DayRegistrationDocument,
} from './day-registration.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { CreateDayRegistrationDto } from './dto/create-day-registration.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DayRegistrationService {
  constructor(
    @InjectModel(DayRegistration.name)
    private readonly dayRegistrationModel: Model<DayRegistrationDocument>,
  ) {}

  async create(
    dto: CreateDayRegistrationDto,
    session?: ClientSession,
  ): Promise<DayRegistrationDocument> {
    const registrationId = 'FEST-' + uuidv4().split('-')[0].toUpperCase();
    const selectedDayIds = (dto.selectedDayIds || []).map(
      (id) => new Types.ObjectId(id),
    );
    const doc = new this.dayRegistrationModel({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      selectedDayIds,
      registrationId,
      paymentId: dto.paymentId,
      paymentStatus: dto.paymentStatus || 'pending',
      couponCode: dto.couponCode,
      amountPaid: dto.amountPaid,
      discountApplied: dto.discountApplied,
    });
    return doc.save({ session }) as Promise<DayRegistrationDocument>;
  }

  async findByPaymentId(
    paymentId: string,
    session?: ClientSession,
  ): Promise<DayRegistrationDocument | null> {
    const query = this.dayRegistrationModel.findOne({ paymentId });
    if (session) {
      query.session(session);
    }
    return query.exec();
  }

  async getStatus(registrationId: string) {
    const reg = await this.dayRegistrationModel
      .findOne({ registrationId })
      .populate('selectedDayIds')
      .lean();
    if (!reg) {
      throw new NotFoundException('Registration not found');
    }
    return {
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      phone: reg.phone,
      paymentStatus: reg.paymentStatus,
      selectedDays: reg.selectedDayIds,
    };
  }

  buildSheetRow(
    reg: {
      registrationId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      paymentStatus: string;
      amountPaid?: number;
      createdAt: Date;
    },
    days: { name: string; date: string }[],
  ): unknown[] {
    const dayNames = days.map((d) => `${d.name} (${d.date})`).join('; ');
    return [
      reg.registrationId,
      reg.firstName,
      reg.lastName,
      reg.email,
      reg.phone,
      dayNames,
      reg.amountPaid ?? '',
      reg.paymentStatus,
      new Date(reg.createdAt).toLocaleString(),
    ];
  }
}
