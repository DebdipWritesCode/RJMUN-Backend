import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sponsor, SponsorDocument } from './sponsor.schema';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

const CLOUDINARY_FOLDER = 'rjmun/sponsors';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectModel(Sponsor.name) private sponsorModel: Model<SponsorDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    data: CreateSponsorDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<Sponsor> {
    const payload: Record<string, unknown> = {
      name: data.name,
      type: data.type,
    };
    if (data.image) {
      const { url, publicId } = await this.cloudinary.upload(
        data.image,
        CLOUDINARY_FOLDER,
        data.imageMimeType,
      );
      payload.imageUrl = url;
      payload.imagePublicId = publicId;
    }
    return this.sponsorModel.create(payload) as Promise<Sponsor>;
  }

  async findAll(): Promise<any[]> {
    return this.sponsorModel.find().lean();
  }

  async findOne(id: string): Promise<any> {
    const sponsor = await this.sponsorModel.findById(id).lean();
    if (!sponsor) {
      throw new NotFoundException(`Sponsor with id ${id} not found`);
    }
    return sponsor;
  }

  async update(
    id: string,
    updateDto: UpdateSponsorDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<Sponsor> {
    const updatePayload: Record<string, unknown> = { ...updateDto };
    if (updateDto.image) {
      const existing = await this.sponsorModel.findById(id).lean().exec();
      if (existing?.imagePublicId) {
        await this.cloudinary.delete(existing.imagePublicId as string);
      }
      const { url, publicId } = await this.cloudinary.upload(
        updateDto.image,
        CLOUDINARY_FOLDER,
        updateDto.imageMimeType,
      );
      updatePayload.imageUrl = url;
      updatePayload.imagePublicId = publicId;
    }
    delete updatePayload.image;
    delete updatePayload.imageMimeType;

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
