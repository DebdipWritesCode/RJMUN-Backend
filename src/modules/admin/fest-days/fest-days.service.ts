import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FestDay, FestDayDocument } from './fest-day.schema';
import { FestOffer, FestOfferDocument } from './fest-offer.schema';
import { Model } from 'mongoose';
import { CreateFestDayDto } from './dto/create-fest-day.dto';
import { UpdateFestDayDto } from './dto/update-fest-day.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

const CLOUDINARY_FOLDER = 'rjmun/fest-days';
const EVENT_CLOUDINARY_FOLDER = 'rjmun/fest-days/events';

@Injectable()
export class FestDaysService {
  constructor(
    @InjectModel(FestDay.name)
    private readonly festDayModel: Model<FestDayDocument>,
    @InjectModel(FestOffer.name)
    private readonly festOfferModel: Model<FestOfferDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /**
   * Parse event files from request and map them to event indices
   * Files are named as event_0_image, event_1_image, etc.
   */
  private parseEventFiles(
    files: Express.Multer.File[] = [],
  ): Map<number, Express.Multer.File> {
    const eventFilesMap = new Map<number, Express.Multer.File>();
    files.forEach((file) => {
      const match = file.fieldname.match(/event_(\d+)_image/);
      if (match) {
        const index = parseInt(match[1], 10);
        eventFilesMap.set(index, file);
      }
    });
    return eventFilesMap;
  }

  /**
   * Process events and upload images for those that have files
   */
  private async processEventImages(
    events: any[],
    eventFiles: Express.Multer.File[],
  ): Promise<any[]> {
    if (!events || events.length === 0) {
      return events;
    }

    const eventFilesMap = this.parseEventFiles(eventFiles);
    const processedEvents: any[] = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const file = eventFilesMap.get(i);

      if (file) {
        try {
          const { url, publicId } = await this.cloudinary.upload(
            file.buffer,
            EVENT_CLOUDINARY_FOLDER,
            file.mimetype,
          );
          processedEvents.push({
            ...event,
            imageUrl: url,
            imagePublicId: publicId,
          });
        } catch (error) {
          console.error(`Failed to upload image for event ${i}:`, error);
          processedEvents.push(event);
        }
      } else {
        processedEvents.push(event);
      }
    }

    return processedEvents;
  }

  /**
   * Identify orphaned event images that need to be deleted
   * Images are orphaned if: event is removed or event image is replaced
   */
  private getOrphanedEventImages(
    oldEvents: any[] = [],
    newEvents: any[] = [],
  ): string[] {
    const orphanedPublicIds: string[] = [];

    oldEvents.forEach((oldEvent, index) => {
      const newEvent = newEvents[index];

      if (!newEvent) {
        // Event was removed, delete its image if it exists
        if (oldEvent.imagePublicId) {
          orphanedPublicIds.push(oldEvent.imagePublicId);
        }
      } else if (
        oldEvent.imagePublicId &&
        newEvent.imagePublicId &&
        oldEvent.imagePublicId !== newEvent.imagePublicId
      ) {
        // Event image was replaced, delete old image
        orphanedPublicIds.push(oldEvent.imagePublicId);
      }
    });

    return [...new Set(orphanedPublicIds)]; // Remove duplicates
  }

  async create(
    dto: CreateFestDayDto & {
      image?: Buffer;
      imageMimeType?: string;
      eventFiles?: Express.Multer.File[];
    },
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

    // Process event images if provided
    if (dto.eventFiles && dto.eventFiles.length > 0) {
      parsedEvents = await this.processEventImages(
        parsedEvents,
        dto.eventFiles,
      );
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
    return this.festDayModel.find({ archived: { $ne: true } }).lean();
  }

  async findOne(id: string): Promise<FestDay> {
    const day = await this.festDayModel.findById(id).exec();
    if (!day) {
      throw new NotFoundException(`Fest day with id ${id} not found`);
    }
    return day;
  }

  async findByIds(ids: string[]): Promise<FestDayDocument[]> {
    return this.festDayModel
      .find({ _id: { $in: ids }, archived: { $ne: true } })
      .exec();
  }

  async update(
    id: string,
    dto: UpdateFestDayDto & {
      image?: Buffer;
      imageMimeType?: string;
      eventFiles?: Express.Multer.File[];
    },
  ): Promise<FestDay> {
    const existing = await this.festDayModel.findById(id).lean().exec();
    if (!existing) {
      throw new NotFoundException(`Fest day with id ${id} not found`);
    }

    const updatePayload: Record<string, unknown> = { ...dto };
    // Parse events if it comes as a stringified JSON (from FormData)
    let updatedEvents: any[] = existing.events;
    if (dto.events !== undefined) {
      if (typeof dto.events === 'string') {
        try {
          updatedEvents = JSON.parse(dto.events);
        } catch {
          updatedEvents = [];
        }
      } else if (Array.isArray(dto.events)) {
        updatedEvents = dto.events as any[];
      }

      // Process event images if provided
      if (dto.eventFiles && dto.eventFiles.length > 0) {
        updatedEvents = await this.processEventImages(
          updatedEvents,
          dto.eventFiles,
        );
      }

      // Delete orphaned event images
      const orphanedPublicIds = this.getOrphanedEventImages(
        existing.events,
        updatedEvents,
      );
      for (const publicId of orphanedPublicIds) {
        try {
          await this.cloudinary.delete(publicId);
        } catch (error) {
          console.error(
            `Failed to delete orphaned event image ${publicId}:`,
            error,
          );
        }
      }

      updatePayload.events = updatedEvents;
    }

    if (dto.image) {
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
    delete updatePayload.eventFiles;

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
