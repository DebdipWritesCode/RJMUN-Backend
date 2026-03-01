import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FestDaysService } from './fest-days.service';
import { CreateFestDayDto } from './dto/create-fest-day.dto';
import { UpdateFestDayDto } from './dto/update-fest-day.dto';
import { UpdateOffersDto } from './dto/update-offers.dto';

@Controller('fest-days')
export class FestDaysController {
  constructor(private readonly festDaysService: FestDaysService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Body() dto: CreateFestDayDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Req() req: any,
  ) {
    const mainFile = files?.find((f) => f.fieldname === 'image');
    const eventFiles = files?.filter((f) => f.fieldname.startsWith('event_'));

    return this.festDaysService.create({
      ...dto,
      image: mainFile?.buffer,
      imageMimeType: mainFile?.mimetype,
      eventFiles: eventFiles || [],
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
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFestDayDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    const mainFile = files?.find((f) => f.fieldname === 'image');
    const eventFiles = files?.filter((f) => f.fieldname.startsWith('event_'));

    return this.festDaysService.update(id, {
      ...dto,
      image: mainFile?.buffer,
      imageMimeType: mainFile?.mimetype,
      eventFiles: eventFiles || [],
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.festDaysService.remove(id);
  }
}
