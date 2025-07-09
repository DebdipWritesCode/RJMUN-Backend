import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CARegistration, CARegistrationDocument } from './ca.schema';
import { CreateCADto } from './dto/create-ca.dto';
import { SheetsService } from '../sheets/sheets.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class CaService {
  constructor(
    @InjectModel(CARegistration.name)
    private readonly caModel: Model<CARegistrationDocument>,
    private readonly sheetsService: SheetsService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateCADto) {
    const ca = new this.caModel(dto);
    const saved = await ca.save();

    // Google Sheets - Sheet2
    const row = [
      saved.fullName,
      saved.email,
      saved.phone,
      saved.institution,
      saved.whyJoin,
      saved.experience,
      new Date().toLocaleString(),
    ];

    await this.sheetsService.appendRegistrationData(
      row,
      process.env.REGISTRATION_SHEET_ID || '',
      'Sheet2!A1',
    );

    // Send confirmation email
    await this.emailService.sendCAConfirmationEmail(
      saved.email,
      saved.fullName,
    );

    return saved;
  }

  async delete(id: string) {
    const deleted = await this.caModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('CA registration not found');
    }
    return deleted;
  }
}
