import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EbService } from './eb.service';
import { CreateEbDto } from './dto/create-eb.dto';
import { UpdateEbDto } from './dto/update-eb.dto';

@Controller('eb')
export class EbController {
  constructor(private readonly ebService: EbService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateEbDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.ebService.create({
      ...dto,
      image: file?.buffer,
      imageMimeType: file?.mimetype,
    });
  }

  @Get()
  findAll() {
    return this.ebService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ebService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEbDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.ebService.update(id, {
      ...dto,
      image: file?.buffer,
      imageMimeType: file?.mimetype,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ebService.remove(id);
  }
}
