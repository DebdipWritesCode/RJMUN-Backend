import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { EbService } from './eb.service';
import { CreateEbDto } from './dto/create-eb.dto';
import { UpdateEbDto } from './dto/update-eb.dto';

@Controller('eb')
export class EbController {
  constructor(private readonly ebService: EbService) {}

  @Post()
  create(@Body() dto: CreateEbDto) {
    return this.ebService.create(dto);
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
  update(@Param('id') id: string, @Body() dto: UpdateEbDto) {
    return this.ebService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ebService.remove(id);
  }
}
