import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamMember, TeamMemberDocument } from './team-member.schema';
import { CreateTeamMemberDto } from './dto/create-team-member';
import { UpdateTeamMemberDto } from './dto/update-team-member';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectModel(TeamMember.name) private teamMemberModel: Model<TeamMemberDocument>,
  ) {}

  async create(dto: CreateTeamMemberDto): Promise<TeamMember> {
    const member = new this.teamMemberModel(dto);
    return member.save();
  }

  async findAll(): Promise<TeamMember[]> {
    return this.teamMemberModel.find().exec();
  }

  async findOne(id: string): Promise<TeamMember> {
    const member = await this.teamMemberModel.findById(id).exec();
    if (!member) throw new NotFoundException(`Team member with id ${id} not found`);
    return member;
  }

  async update(id: string, dto: UpdateTeamMemberDto): Promise<TeamMember> {
    const updated = await this.teamMemberModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) throw new NotFoundException(`Team member with id ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<TeamMember> {
    const deleted = await this.teamMemberModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Team member with id ${id} not found`);
    return deleted;
  }
}
