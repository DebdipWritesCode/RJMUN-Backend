import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommitteesService } from './committees.service';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';

@Controller('committees')
export class CommitteesController {
  constructor(private readonly committeeService: CommitteesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateCommitteeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.committeeService.create({
      ...dto,
      image: file?.buffer,
      imageMimeType: file?.mimetype,
    });
  }

  @Get()
  findAll() {
    return this.committeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.committeeService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommitteeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.committeeService.update(id, {
      ...dto,
      image: file?.buffer,
      imageMimeType: file?.mimetype,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.committeeService.remove(id);
  }
}
