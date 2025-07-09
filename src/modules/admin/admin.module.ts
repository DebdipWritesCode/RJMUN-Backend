import { Module } from '@nestjs/common';
import { CommitteesModule } from './committees/committees.module';
import { EbModule } from './eb/eb.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { FaqsModule } from './faqs/faqs.module';

@Module({
  imports: [
    CommitteesModule,
    EbModule,
    SponsorsModule,
    TeamMembersModule,
    FaqsModule,
  ],
})
export class AdminModule {}
