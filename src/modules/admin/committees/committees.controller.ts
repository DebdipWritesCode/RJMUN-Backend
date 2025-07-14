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

  @Get('get-portfolios')
  getAllCommitteePortfolios() {
    return this.committeeService.getAllCommitteePortfolios();
  }

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

  @Post(':id/portfolio')
  addPortfolio(@Param('id') id: string, @Body('portfolio') portfolio: string) {
    return this.committeeService.addPortfolio(id, portfolio);
  }

  @Post(':id/portfolios')
  addPortfolios(
    @Param('id') id: string,
    @Body('portfolios') portfolios: string[],
  ) {
    return this.committeeService.addPortfolios(id, portfolios);
  }

  @Delete(':id/portfolio')
  removePortfolio(
    @Param('id') id: string,
    @Body('portfolio') portfolio: string,
  ) {
    return this.committeeService.removePortfolio(id, portfolio);
  }
}
