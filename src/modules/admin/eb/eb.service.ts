import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EB, EBDocument } from './eb.schema';
import { CreateEbDto } from './dto/create-eb.dto';
import { UpdateEbDto } from './dto/update-eb.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

const CLOUDINARY_FOLDER = 'rjmun/eb';

@Injectable()
export class EbService {
  constructor(
    @InjectModel(EB.name) private ebModel: Model<EBDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    data: CreateEbDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<EB> {
    const payload: Record<string, unknown> = {
      name: data.name,
      position: data.position,
      committee: data.committee,
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
    return this.ebModel.create(payload) as Promise<EB>;
  }

  async findAll(): Promise<any[]> {
    return this.ebModel.find().lean();
  }

  async findOne(id: string): Promise<any> {
    const eb = await this.ebModel.findById(id).lean();
    if (!eb) {
      throw new NotFoundException(`EB with id ${id} not found`);
    }
    return eb;
  }

  async update(
    id: string,
    updateDto: UpdateEbDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<EB> {
    const updatePayload: Record<string, unknown> = { ...updateDto };
    if (updateDto.image) {
      const existing = await this.ebModel.findById(id).lean().exec();
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

    const updated = await this.ebModel
      .findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updated) {
      throw new NotFoundException(`EB with id ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<EB> {
    const deleted = await this.ebModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`EB with id ${id} not found`);
    }
    return deleted;
  }
}
