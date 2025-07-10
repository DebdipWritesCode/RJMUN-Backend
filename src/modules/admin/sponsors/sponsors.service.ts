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

  async create(
    data: CreateSponsorDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<Sponsor> {
    return this.sponsorModel.create(data);
  }

  async findAll(): Promise<any[]> {
    const sponsors = await this.sponsorModel.find().lean();

    return sponsors.map((sponsor) => ({
      ...sponsor,
      imageUrl: sponsor.image
        ? `data:${sponsor.imageMimeType};base64,${sponsor.image.toString('base64')}`
        : null,
    }));
  }

  async findOne(id: string): Promise<any> {
    const sponsor = await this.sponsorModel.findById(id).lean();
    if (!sponsor) {
      throw new NotFoundException(`Sponsor with id ${id} not found`);
    }

    return {
      ...sponsor,
      imageUrl: sponsor.image
        ? `data:${sponsor.imageMimeType};base64,${sponsor.image.toString('base64')}`
        : null,
    };
  }

  async update(
    id: string,
    updateDto: UpdateSponsorDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<Sponsor> {
    const updatePayload: any = { ...updateDto };

    if (!updateDto.image) {
      delete updatePayload.image;
      delete updatePayload.imageMimeType;
    }

    const updated = await this.sponsorModel
      .findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Sponsor with id ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<Sponsor> {
    const deleted = await this.sponsorModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Sponsor with id ${id} not found`);
    }
    return deleted;
  }
}
