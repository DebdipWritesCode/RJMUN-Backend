import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sponsor, SponsorDocument } from './sponsor.schema';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectModel(Sponsor.name) private sponsorModel: Model<SponsorDocument>,
  ) {}

  async create(dto: CreateSponsorDto): Promise<Sponsor> {
    const sponsor = new this.sponsorModel(dto);
    return sponsor.save();
  }

  async findAll(): Promise<Sponsor[]> {
    return this.sponsorModel.find().exec();
  }

  async findOne(id: string): Promise<Sponsor> {
    const sponsor = await this.sponsorModel.findById(id).exec();
    if (!sponsor) throw new NotFoundException(`Sponsor with id ${id} not found`);
    return sponsor;
  }

  async update(id: string, dto: UpdateSponsorDto): Promise<Sponsor> {
    const updated = await this.sponsorModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) throw new NotFoundException(`Sponsor with id ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<Sponsor> {
    const deleted = await this.sponsorModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Sponsor with id ${id} not found`);
    return deleted;
  }
}
