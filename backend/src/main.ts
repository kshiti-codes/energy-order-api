import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      /^http:\/\/localhost:\d+$/,                        // all localhost ports (dev)
      'https://energy-order.web.app',                    // Firebase Hosting (prod)
      'https://energy-order--default-rtdb.firebaseio.com' // optional, if you ever add Firebase DB
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log('EnergyOrder API running on http://localhost:3000');
}
bootstrap();
