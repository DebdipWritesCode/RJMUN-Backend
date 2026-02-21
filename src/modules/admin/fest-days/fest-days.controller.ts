import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FestDaysService } from './fest-days.service';
import { CreateFestDayDto } from './dto/create-fest-day.dto';
import { UpdateFestDayDto } from './dto/update-fest-day.dto';
import { UpdateOffersDto } from './dto/update-offers.dto';

@Controller('fest-days')
export class FestDaysController {
  constructor(private readonly festDaysService: FestDaysService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateFestDayDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.festDaysService.create({
      ...dto,
      image: file?.buffer,
      imageMimeType: file?.mimetype,
    });
  }

  @Get()
  findAll() {
    return this.festDaysService.findAll();
  }

  @Get('offers')
  getOffers() {
    return this.festDaysService.getOffers();
  }

  @Put('offers')
  updateOffers(@Body() dto: UpdateOffersDto) {
    return this.festDaysService.updateOffers(dto.discounts);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.festDaysService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFestDayDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.festDaysService.update(id, {
      ...dto,
      image: file?.buffer,
      imageMimeType: file?.mimetype,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.festDaysService.remove(id);
  }
}
