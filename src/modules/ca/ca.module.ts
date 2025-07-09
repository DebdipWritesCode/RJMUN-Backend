import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CARegistration, CARegistrationSchema } from './ca.schema';
import { CaService } from './ca.service';
import { CaController } from './ca.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CARegistration.name, schema: CARegistrationSchema },
    ]),
  ],
  controllers: [CaController],
  providers: [CaService],
})
export class CaModule {}
