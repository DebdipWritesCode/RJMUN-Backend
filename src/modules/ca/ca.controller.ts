import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { CaService } from './ca.service';
import { CreateCADto } from './dto/create-ca.dto';

@Controller('ca')
export class CaController {
  constructor(private readonly caService: CaService) {}

  @Post()
  async registerCA(@Body() dto: CreateCADto) {
    return this.caService.create(dto);
  }

  @Delete(':id')
  async deleteCA(@Param('id') id: string) {
    return this.caService.delete(id);
  }
}
