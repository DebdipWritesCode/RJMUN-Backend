import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamMember, TeamMemberDocument } from './team-member.schema';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectModel(TeamMember.name)
    private teamMemberModel: Model<TeamMemberDocument>,
  ) {}

  async create(
    data: CreateTeamMemberDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<TeamMember> {
    return this.teamMemberModel.create(data);
  }

  async findAll(): Promise<any[]> {
    const members = await this.teamMemberModel.find().lean();
    return members.map((member) => ({
      ...member,
      imageUrl: member.image
        ? `data:${member.imageMimeType};base64,${member.image.toString('base64')}`
        : null,
    }));
  }

  async findOne(id: string): Promise<any> {
    const member = await this.teamMemberModel.findById(id).lean();
    if (!member) {
      throw new NotFoundException(`Team member with id ${id} not found`);
    }

    return {
      ...member,
      imageUrl: member.image
        ? `data:${member.imageMimeType};base64,${member.image.toString('base64')}`
        : null,
    };
  }

  async update(
    id: string,
    updateDto: UpdateTeamMemberDto & { image?: Buffer; imageMimeType?: string },
  ): Promise<TeamMember> {
    const updatePayload: any = { ...updateDto };

    if (!updateDto.image) {
      delete updatePayload.image;
      delete updatePayload.imageMimeType;
    }

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
