import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  const port = configService.getOrThrow<number>('PROCESSOR_PORT');

  app.useLogger(logger);

  await app.listen(port);
  logger.log(`🫡 PROCESSOR is running on: http://localhost:${port}/`);
}

void bootstrap();
