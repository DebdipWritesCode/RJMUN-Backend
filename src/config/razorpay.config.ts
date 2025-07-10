import { ConfigService } from '@nestjs/config';

export const razorpayConfigFactory = (configService: ConfigService) => ({
  key_id: configService.get<string>('RAZORPAY_KEY_ID'),
  key_secret: configService.get<string>('RAZORPAY_KEY_SECRET'),
});