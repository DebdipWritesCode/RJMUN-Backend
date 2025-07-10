import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CARegistration, CARegistrationSchema } from './ca.schema';
import { CaService } from './ca.service';
import { CaController } from './ca.controller';
import { SheetsModule } from '../sheets/sheets.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CARegistration.name, schema: CARegistrationSchema },
    ]),
    EmailModule,
    SheetsModule,
  ],
  controllers: [CaController],
  providers: [CaService],
})
export class CaModule {}
