import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Registration, RegistrationDocument } from './registration.schema';
import { Model } from 'mongoose';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrantSummaryDto } from './dto/registration-summary.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateAllotmentDto } from './dto/update-allotment.dto';

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
      registrationId,
    });

    return await newReg.save();
  }

  async getAllRegistrants(): Promise<RegistrantSummaryDto[]> {
    const registrants = await this.registrationModel
      .find(
        {},
        {
          registrationId: 1,
          fullName: 1,
          institution: 1,
          committeePreference1: 1,
          committeePreference2: 1,
          portfolioPreference1ForCommitteePreference1: 1,
          portfolioPreference2ForCommitteePreference1: 1,
          portfolioPreference1ForCommitteePreference2: 1,
          portfolioPreference2ForCommitteePreference2: 1,
          allotmentStatus: 1,
          allottedCommittee: 1,
          allottedPortfolio: 1,
        },
      )
      .lean();

    return registrants.map((reg: any) => ({
      ...reg,
      _id: reg._id.toString(),
    }));
  }

  async getStatus(registrationId: string) {
    const reg = await this.registrationModel.findOne({ registrationId });
    if (!reg) throw new NotFoundException('Registration not found');

    return {
      fullName: reg.fullName,
      status: reg.allotmentStatus,
      allottedCommittee: reg.allottedCommittee,
      allottedPortfolio: reg.allottedPortfolio,
    };
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

  async bulkUpdateAllotments(
    allotments: UpdateAllotmentDto[],
  ): Promise<{ updated: number; failed: string[] }> {
    const failed: string[] = [];

    const operations = allotments.map(async (dto) => {
      const updated = await this.registrationModel.findOneAndUpdate(
        { registrationId: dto.registrationId },
        {
          allotmentStatus: 'allotted',
          allottedCommittee: dto.allottedCommittee,
          allottedPortfolio: dto.allottedPortfolio,
        },
        { new: true },
      );

      if (!updated) failed.push(dto.registrationId);
    });

    await Promise.all(operations);

    return {
      updated: allotments.length - failed.length,
      failed,
    };
  }

  async delete(id: string) {
    return this.registrationModel.findByIdAndDelete(id);
  }
}
