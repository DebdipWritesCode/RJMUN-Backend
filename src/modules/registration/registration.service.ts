import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Registration, RegistrationDocument } from './registration.schema';
import { ClientSession, Model } from 'mongoose';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrantSummaryDto } from './dto/registration-summary.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateAllotmentDto } from './dto/update-allotment.dto';
import { EmailService } from '../email/email.service';
import { SheetsService } from '../sheets/sheets.service';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<RegistrationDocument>,
    private readonly emailService: EmailService,
    private readonly sheetsService: SheetsService,
  ) {}

  async create(dto: CreateRegistrationDto, session?: ClientSession) {
    const registrationId = 'RJMUN' + uuidv4().split('-')[0].toUpperCase();

    const newReg = new this.registrationModel({
      ...dto,
      registrationId,
    });

    return await newReg.save({ session });
  }

  async findByPaymentId(paymentId: string, session?: ClientSession) {
    const query = this.registrationModel.findOne({ paymentId }).lean();
    if (session) {
      query.session(session);
    }
    return await query.exec();
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
          numberOfMUNsParticipated: 1,
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
        isAllotmentUpdated: true,
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
      if (!dto.allottedCommittee?.trim() && !dto.allottedPortfolio?.trim()) {
        return;
      }

      const updated = await this.registrationModel.findOneAndUpdate(
        { registrationId: dto.registrationId },
        {
          allotmentStatus: 'allotted',
          allottedCommittee: dto.allottedCommittee,
          allottedPortfolio: dto.allottedPortfolio,
          isAllotmentUpdated: true,
        },
        { new: true },
      );

      if (!updated) {
        failed.push(dto.registrationId);
      }
    });

    await Promise.all(operations);

    const attempted = allotments.filter(
      (dto) => dto.allottedCommittee?.trim() || dto.allottedPortfolio?.trim(),
    ).length;

    return {
      updated: attempted - failed.length,
      failed,
    };
  }

  async sendAllotmentEmails() {
    const allotted = await this.registrationModel.find({
      allotmentStatus: 'allotted',
      isAllotmentUpdated: true,
    });

    const results = {
      sent: 0,
      failed: [] as string[],
    };
    const sentIds: typeof allotted[0]['_id'][] = [];

    for (const reg of allotted) {
      try {
        await this.emailService.sendAllotmentEmail(
          reg.email,
          reg.fullName,
          reg.allottedCommittee || 'N/A',
          reg.allottedPortfolio || 'N/A',
        );
        results.sent++;
        sentIds.push(reg._id);
      } catch (err) {
        results.failed.push(reg.registrationId);
        console.error(`Failed to send to ${reg.email}:`, err);
      }
    }

    if (sentIds.length > 0) {
      await this.registrationModel.updateMany(
        { _id: { $in: sentIds } },
        { $set: { isAllotmentUpdated: false } },
      );
    }

    return results;
  }

  async updateAllotmentsSheets() {
    const spreadsheetId = process.env.REGISTRATION_SHEET_ID;
    if (!spreadsheetId) {
      throw new Error('REGISTRATION_SHEET_ID not set in environment');
    }

    const registrations = await this.registrationModel.find({
      allotmentStatus: 'allotted',
      allottedCommittee: { $exists: true, $ne: null },
    });

    console.log(`Found ${registrations.length} allotted registrations`);

    const committeeMap = new Map<
      string,
      {
        registrationId: string;
        fullName: string;
        allottedPortfolio: string;
      }[]
    >();

    for (const reg of registrations) {
      const committee = reg.allottedCommittee;
      if (!committee) continue;

      if (!committeeMap.has(committee)) {
        committeeMap.set(committee, []);
      }

      const arr = committeeMap.get(committee);
      if (arr) {
        if (!reg.allottedPortfolio) {
          reg.allottedPortfolio = 'N/A';
        }

        arr.push({
          registrationId: reg.registrationId,
          fullName: reg.fullName,
          allottedPortfolio: reg.allottedPortfolio,
        });
      }
    }

    const allotmentsData = Array.from(committeeMap.entries()).map(
      ([committee, entries]) => ({
        committee,
        entries,
      }),
    );

    await this.sheetsService.updateAllotments(spreadsheetId, allotmentsData);

    return {
      message: 'Allotment sheets updated successfully',
      totalCommittees: allotmentsData.length,
    };
  }

  async delete(id: string) {
    return this.registrationModel.findByIdAndDelete(id);
  }
}
