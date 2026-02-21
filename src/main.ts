import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

console.log('🔄 Starting NestJS bootstrap...');

async function bootstrap() {
  console.log('⚙️  Creating NestJS app...');

  const defaultOrigins = [
    'https://rjmun-frontend.vercel.app',
    'https://rjmun.in',
    'https://www.rjmun.in',
    'https://mun.rjmun.in',
  ];
  const envOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];
  const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  });

  console.log('✅ App created. Setting up global pipes...');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  console.log(`🚀 Starting app on port ${port}...`);

  await app.listen(port);

  console.log(`✅ App is now listening on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Error during bootstrap:', err);
});
