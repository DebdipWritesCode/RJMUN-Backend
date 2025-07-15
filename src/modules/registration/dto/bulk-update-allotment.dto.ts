import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateAllotmentDto } from './update-allotment.dto';

export class BulkUpdateAllotmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAllotmentDto)
  allotments: UpdateAllotmentDto[];
}
