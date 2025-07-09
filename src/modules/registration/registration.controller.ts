import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateAllotmentDto } from './dto/update-allotment';

@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  async register(@Body() dto: CreateRegistrationDto) {
    return this.registrationService.create(dto);
  }

  @Get('status/:registrationId')
  async checkStatus(@Param('registrationId') id: string) {
    return this.registrationService.getStatus(id);
  }

  @Patch('allot')
  async allot(@Body() dto: UpdateAllotmentDto) {
    return this.registrationService.updateAllotment(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.registrationService.delete(id);
  }
}
