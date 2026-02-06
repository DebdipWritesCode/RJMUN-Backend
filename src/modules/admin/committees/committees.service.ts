import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Committee, CommitteeDocument } from './committee.schema';
import { Model } from 'mongoose';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

const CLOUDINARY_FOLDER = 'rjmun/committees';

@Injectable()
export class CommitteesService {
  constructor(
    @InjectModel(Committee.name)
    private committeeModel: Model<CommitteeDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    data: CreateCommitteeDto & { image?: Buffer; imageMimeType?: string },
  ) {
    const payload: Record<string, unknown> = {
      name: data.name,
      agenda: data.agenda,
      backgroundGuideURL: data.backgroundGuideURL,
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
    return this.committeeModel.create(payload);
  }

  async findAll() {
    return this.committeeModel.find().lean();
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
    const updatePayload: Record<string, unknown> = { ...updateDto };
    if (updateDto.image) {
      const existing = await this.committeeModel.findById(id).lean().exec();
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
