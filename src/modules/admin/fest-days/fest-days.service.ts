import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FestDay, FestDayDocument } from './fest-day.schema';
import { FestOffer, FestOfferDocument } from './fest-offer.schema';
import { Model } from 'mongoose';
import { CreateFestDayDto } from './dto/create-fest-day.dto';
import { UpdateFestDayDto } from './dto/update-fest-day.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

const CLOUDINARY_FOLDER = 'rjmun/fest-days';

@Injectable()
export class FestDaysService {
  constructor(
    @InjectModel(FestDay.name)
    private readonly festDayModel: Model<FestDayDocument>,
    @InjectModel(FestOffer.name)
    private readonly festOfferModel: Model<FestOfferDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    dto: CreateFestDayDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<FestDay> {
    // Parse events if it comes as a stringified JSON (from FormData)
    let parsedEvents: any[] = [];
    if (dto.events) {
      if (typeof dto.events === 'string') {
        try {
          parsedEvents = JSON.parse(dto.events);
        } catch {
          parsedEvents = [];
        }
      } else if (Array.isArray(dto.events)) {
        parsedEvents = dto.events;
      }
    }

    const payload: Record<string, unknown> = {
      date: dto.date,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      events: parsedEvents,
    };
    if (dto.image) {
      const { url, publicId } = await this.cloudinary.upload(
        dto.image,
        CLOUDINARY_FOLDER,
        dto.imageMimeType,
      );
      payload.imageUrl = url;
      payload.imagePublicId = publicId;
    }
    return this.festDayModel.create(payload);
  }

  async findAll(): Promise<FestDay[]> {
    return this.festDayModel.find().lean();
  }

  async findOne(id: string): Promise<FestDay> {
    const day = await this.festDayModel.findById(id).exec();
    if (!day) {
      throw new NotFoundException(`Fest day with id ${id} not found`);
    }
    return day;
  }

  async findByIds(ids: string[]): Promise<FestDayDocument[]> {
    return this.festDayModel.find({ _id: { $in: ids } }).exec();
  }

  async update(
    id: string,
    dto: UpdateFestDayDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<FestDay> {
    const updatePayload: Record<string, unknown> = { ...dto };


    // Parse events if it comes as a stringified JSON (from FormData)
    if (dto.events !== undefined) {
      if (typeof dto.events === 'string') {
        try {
          updatePayload.events = JSON.parse(dto.events);
        } catch {
          updatePayload.events = [];
        }
      } else if (Array.isArray(dto.events)) {
        updatePayload.events = dto.events;
      }
    }

    if (dto.image) {
      const existing = await this.festDayModel.findById(id).lean().exec();
      if (existing?.imagePublicId) {
        await this.cloudinary.delete(existing.imagePublicId as string);
      }
      const { url, publicId } = await this.cloudinary.upload(
        dto.image,
        CLOUDINARY_FOLDER,
        dto.imageMimeType,
      );
      updatePayload.imageUrl = url;
      updatePayload.imagePublicId = publicId;
    }
    delete updatePayload.image;
    delete updatePayload.imageMimeType;

    const updated = await this.festDayModel
      .findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Fest day with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<FestDay> {
    const deleted = await this.festDayModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Fest day with id ${id} not found`);
    }
    return deleted;
  }

  async getOffers(): Promise<Record<string, number>> {
    const doc = await this.festOfferModel.findOne().lean().exec();
    if (!doc || !doc.discounts) {
      return {};
    }
    const map = doc.discounts as unknown as Map<string, number>;
    return map instanceof Map
      ? Object.fromEntries(map)
      : (doc.discounts as Record<string, number>);
  }

  async updateOffers(
    discounts: Record<string, number>,
  ): Promise<Record<string, number>> {
    const map = new Map<string, number>(Object.entries(discounts));
    const updated = await this.festOfferModel
      .findOneAndUpdate({}, { discounts: map }, { upsert: true, new: true })
      .lean()
      .exec();
    if (!updated || !updated.discounts) {
      return {};
    }
    const m = updated.discounts as unknown as Map<string, number>;
    return m instanceof Map
      ? Object.fromEntries(m)
      : (updated.discounts as Record<string, number>);
  }
}
