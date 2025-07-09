import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamMemberDto } from './create-team-member';

export class UpdateTeamMemberDto extends PartialType(CreateTeamMemberDto) {}
