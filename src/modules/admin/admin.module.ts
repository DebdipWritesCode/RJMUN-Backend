import { Module } from '@nestjs/common';
import { CommitteesModule } from './committees/committees.module';
import { EbModule } from './eb/eb.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { FaqsModule } from './faqs/faqs.module';
import { FestDaysModule } from './fest-days/fest-days.module';
import { LoginController } from './login.controller';

@Module({
  imports: [
    CommitteesModule,
    EbModule,
    SponsorsModule,
    TeamMembersModule,
    FaqsModule,
    FestDaysModule,
  ],
  controllers: [LoginController],
})
export class AdminModule {}
