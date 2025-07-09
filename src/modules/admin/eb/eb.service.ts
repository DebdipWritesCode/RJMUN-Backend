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

  async create(createEbDto: CreateEbDto): Promise<EB> {
    const createdEb = new this.ebModel(createEbDto);
    return createdEb.save();
  }

  async findAll(): Promise<EB[]> {
    return this.ebModel.find().exec();
  }

  async findOne(id: string): Promise<EB> {
    const eb = await this.ebModel.findById(id).exec();
    if (!eb) {
      throw new NotFoundException(`EB with id ${id} not found`);
    }
    return eb;
  }

  async update(id: string, updateEbDto: UpdateEbDto): Promise<EB> {
    const updated = await this.ebModel.findByIdAndUpdate(id, updateEbDto, {
      new: true,
      runValidators: true,
    }).exec();

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
