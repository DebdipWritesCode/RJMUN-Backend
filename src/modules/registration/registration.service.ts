import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Registration, RegistrationDocument } from './registration.schema';
import { Model } from 'mongoose';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateAllotmentDto } from './dto/update-allotment';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<RegistrationDocument>,
  ) {}

  async create(dto: CreateRegistrationDto) {
    const registrationId = 'RJMUN' + uuidv4().split('-')[0].toUpperCase();

    const newReg = new this.registrationModel({
      ...dto,
      registrationId
    });

    return await newReg.save();
  }

  async getStatus(registrationId: string) {
    const reg = await this.registrationModel.findOne({ registrationId });
    if (!reg) throw new NotFoundException('Registration not found');

    return {
      fullName: reg.fullName,
      status: reg.allotmentStatus,
      allottedCommittee: reg.allottedCommittee,
      allottedPortfolio: reg.allottedPortfolio,
    }
  }

  async updateAllotment(dto: UpdateAllotmentDto) {
    const reg = await this.registrationModel.findOneAndUpdate(
      { registrationId: dto.registrationId },
      {
        allotmentStatus: 'allotted',
        allottedCommittee: dto.allottedCommittee,
        allottedPortfolio: dto.allottedPortfolio,
      },
      { new: true },
    );
    if (!reg) throw new NotFoundException('Registration not found');
    return reg;
  }

  async delete(id: string) {
    return this.registrationModel.findByIdAndDelete(id);
  }
}
