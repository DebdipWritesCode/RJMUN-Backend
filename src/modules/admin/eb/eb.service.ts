import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EB, EBDocument } from './eb.schema';
import { CreateEbDto } from './dto/create-eb.dto';
import { UpdateEbDto } from './dto/update-eb.dto';

@Injectable()
export class EbService {
  constructor(
    @InjectModel(EB.name) private ebModel: Model<EBDocument>,
  ) {}

  async create(
    data: CreateEbDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<EB> {
    return this.ebModel.create(data);
  }

  async findAll(): Promise<any[]> {
    const ebs = await this.ebModel.find().lean();

    return ebs.map((eb) => ({
      ...eb,
      imageUrl: eb.image
        ? `data:${eb.imageMimeType};base64,${eb.image.toString('base64')}`
        : null,
    }));
  }

  async findOne(id: string): Promise<any> {
    const eb = await this.ebModel.findById(id).lean();
    if (!eb) {
      throw new NotFoundException(`EB with id ${id} not found`);
    }

    return {
      ...eb,
      imageUrl: eb.image
        ? `data:${eb.imageMimeType};base64,${eb.image.toString('base64')}`
        : null,
    };
  }

  async update(
    id: string,
    updateDto: UpdateEbDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<EB> {
    const updatePayload: any = { ...updateDto };

    if (!updateDto.image) {
      delete updatePayload.image;
      delete updatePayload.imageMimeType;
    }

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
