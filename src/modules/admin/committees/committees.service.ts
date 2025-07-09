import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Committee, CommitteeDocument } from './committee.schema';
import { Model } from 'mongoose';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';

@Injectable()
export class CommitteesService {
  constructor(
    @InjectModel(Committee.name) private committeeModel: Model<CommitteeDocument>,
  ) {}

  async create(createCommitteeDto: CreateCommitteeDto): Promise<Committee> {
    const created = new this.committeeModel(createCommitteeDto);
    return created.save();
  }

  async findAll(): Promise<Committee[]> {
    return this.committeeModel.find().exec();
  }

  async findOne(id: string): Promise<Committee> {
    const committee = await this.committeeModel.findById(id).exec();
    if (!committee) {
      throw new NotFoundException(`Committee with id ${id} not found`);
    }
    return committee;
  }

  async update(id: string, updateDto: UpdateCommitteeDto): Promise<Committee> {
    const updated = await this.committeeModel.findByIdAndUpdate(id, updateDto, {
      new: true,
      runValidators: true,
    }).exec();

    if (!updated) {
      throw new NotFoundException(`Committee with id ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<Committee> {
    const deleted = await this.committeeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Committee with id ${id} not found`);
    }
    return deleted;
  }
}
