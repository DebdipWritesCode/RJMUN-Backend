import { PartialType } from '@nestjs/mapped-types';
import { CreateEbDto } from './create-eb.dto';

export class UpdateEbDto extends PartialType(CreateEbDto) {}
