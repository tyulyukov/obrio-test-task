import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { ApiModule } from './api.module';
import { apiReference } from '@scalar/nestjs-api-reference';
import { NodeEnvironment } from '@shared/enums/node-env.enum';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  const port = configService.getOrThrow<number>('PORT');
  const nodeEnv = configService.getOrThrow<NodeEnvironment>('NODE_ENV');

  app.enableCors();
  app.useLogger(logger);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });

  if (nodeEnv !== NodeEnvironment.PRODUCTION) {
    const config = new DocumentBuilder()
      .setTitle('Files API')
      .setDescription('API for managing files')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    app.use(
      '/docs',
      apiReference({
        theme: 'deepSpace',
        spec: {
          content: document,
        },
      }),
    );
  }

  await app.listen(port);
  logger.log(`🫡 API is running on: http://localhost:${port}/docs`);
}

void bootstrap();
