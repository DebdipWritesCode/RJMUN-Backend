import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FAQ, FAQDocument } from './faq.schema';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(
    @InjectModel(FAQ.name) private faqModel: Model<FAQDocument>,
  ) {}

  async create(createDto: CreateFaqDto): Promise<FAQ> {
    const faq = new this.faqModel(createDto);
    return faq.save();
  }

  async findAll(): Promise<FAQ[]> {
    return this.faqModel.find().exec();
  }

  async findOne(id: string): Promise<FAQ> {
    const faq = await this.faqModel.findById(id).exec();
    if (!faq) throw new NotFoundException(`FAQ with id ${id} not found`);
    return faq;
  }

  async update(id: string, updateDto: UpdateFaqDto): Promise<FAQ> {
    const updated = await this.faqModel.findByIdAndUpdate(id, updateDto, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) throw new NotFoundException(`FAQ with id ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<FAQ> {
    const deleted = await this.faqModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`FAQ with id ${id} not found`);
    return deleted;
  }
}
