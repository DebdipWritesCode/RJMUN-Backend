import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Committee, CommitteeDocument } from './committee.schema';
import { Model } from 'mongoose';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';

@Injectable()
export class CommitteesService {
  constructor(
    @InjectModel(Committee.name)
    private committeeModel: Model<CommitteeDocument>,
  ) {}

  async create(
    data: CreateCommitteeDto & { image?: Buffer; imageMimeType?: string },
  ) {
    return this.committeeModel.create(data);
  }

  async findAll() {
    return this.committeeModel
      .find()
      .lean()
      .then((committees) =>
        committees.map((c) => ({
          ...c,
          imageUrl: c.image
            ? `data:${c.imageMimeType};base64,${c.image.toString('base64')}`
            : null,
        })),
      );
  }

  async findOne(id: string): Promise<Committee> {
    const committee = await this.committeeModel.findById(id).exec();
    if (!committee) {
      throw new NotFoundException(`Committee with id ${id} not found`);
    }
    return committee;
  }

  async update(
    id: string,
    updateDto: UpdateCommitteeDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<Committee> {
    const updatePayload: any = { ...updateDto };

    if (!updateDto.image) {
      delete updatePayload.image;
      delete updatePayload.imageMimeType;
    }

    const updated = await this.committeeModel
      .findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
      })
      .exec();

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

  async getAllCommitteePortfolios() {
    return this.committeeModel
      .find({}, { _id: 1, name: 1, portfolios: 1 })
      .lean();
  }

  async updatePortfolios(id: string, portfolios: string[]) {
    const committee = await this.committeeModel.findById(id);
    if (!committee) throw new NotFoundException('Committee not found');

    committee.portfolios = portfolios;
    return committee.save();
  }
}
