import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AdminModule } from './modules/admin/admin.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { CaModule } from './modules/ca/ca.module';
import { EmailModule } from './modules/email/email.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { DayRegistrationModule } from './modules/day-registration/day-registration.module';
import { SheetsModule } from './modules/sheets/sheets.module';
import { CouponsModule } from './modules/coupons/coupons.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        if (!uri) {
          throw new Error('MONGO_URI environment variable is not set');
        }
        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),

    CloudinaryModule,
    AdminModule,
    CaModule,
    EmailModule,
    PaymentModule,
    RegistrationModule,
    DayRegistrationModule,
    SheetsModule,
    CouponsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
