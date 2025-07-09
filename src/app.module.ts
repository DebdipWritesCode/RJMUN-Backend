import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './modules/admin/admin.module';
import { CaModule } from './modules/ca/ca.module';
import { EmailModule } from './modules/email/email.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { SheetsModule } from './modules/sheets/sheets.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      (() => {
        if (!process.env.MONGO_URI) {
          throw new Error('MONGO_URI environment variable is not set');
        }
        return process.env.MONGO_URI;
      })()
    ),
    AdminModule,
    CaModule,
    EmailModule,
    PaymentModule,
    RegistrationModule,
    SheetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
