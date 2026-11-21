import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  /**
   * 1. Enable Cross-Origin Resource Sharing (CORS)
   *    Allows frontend applications running on other domains/ports
   *    (e.g., React on localhost:3000) to communicate with this backend API.
   */
  app.enableCors();

  /**
   * 2. Global ValidationPipe
   *    - whitelist: true strips away any unknown properties sent by the client
   *      that are not defined in the DTO (prevents property injection attacks).
   *    - transform: true automatically converts incoming payloads into typed DTO instances.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Library API server running on: http://localhost:${port}`);
}

await bootstrap();
