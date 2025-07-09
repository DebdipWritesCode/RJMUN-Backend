import { Module } from '@nestjs/common';
import { CommitteesService } from './committees.service';
import { CommitteesController } from './committees.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Committee, CommitteeSchema } from './committee.schema';

@Module({
  providers: [CommitteesService],
  controllers: [CommitteesController],
  imports: [
    MongooseModule.forFeature([
      { name: Committee.name, schema: CommitteeSchema },
    ]),
  ],
})
export class CommitteesModule {}
