import { Module } from '@nestjs/common';
import { SheetsService } from './sheets.service';

@Module({
  providers: [SheetsService],
})
export class SheetsModule {}
