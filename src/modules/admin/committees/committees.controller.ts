import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CommitteesService } from './committees.service';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';

@Controller('committees')
export class CommitteesController {
  constructor(private readonly committeeService: CommitteesService) {}

  @Post()
  create(@Body() dto: CreateCommitteeDto) {
    return this.committeeService.create(dto);
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
  update(@Param('id') id: string, @Body() dto: UpdateCommitteeDto) {
    return this.committeeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.committeeService.remove(id);
  }
}
