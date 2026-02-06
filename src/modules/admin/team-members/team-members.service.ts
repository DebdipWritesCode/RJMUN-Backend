import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamMember, TeamMemberDocument } from './team-member.schema';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

const CLOUDINARY_FOLDER = 'rjmun/team-members';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectModel(TeamMember.name)
    private teamMemberModel: Model<TeamMemberDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    data: CreateTeamMemberDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<TeamMember> {
    const payload: Record<string, unknown> = {
      name: data.name,
      position: data.position,
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
    return this.teamMemberModel.create(payload) as Promise<TeamMember>;
  }

  async findAll(): Promise<any[]> {
    return this.teamMemberModel.find().lean();
  }

  async findOne(id: string): Promise<any> {
    const member = await this.teamMemberModel.findById(id).lean();
    if (!member) {
      throw new NotFoundException(`Team member with id ${id} not found`);
    }
    return member;
  }

  async update(
    id: string,
    updateDto: UpdateTeamMemberDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<TeamMember> {
    const updatePayload: Record<string, unknown> = { ...updateDto };
    if (updateDto.image) {
      const existing = await this.teamMemberModel.findById(id).lean().exec();
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

    const updated = await this.teamMemberModel
      .findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Team member with id ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<TeamMember> {
    const deleted = await this.teamMemberModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Team member with id ${id} not found`);
    }
    return deleted;
  }
}
