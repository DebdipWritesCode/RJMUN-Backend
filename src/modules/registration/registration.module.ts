import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Registration, RegistrationSchema } from './registration.schema';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
    ]),
    forwardRef(() => PaymentModule),
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}
