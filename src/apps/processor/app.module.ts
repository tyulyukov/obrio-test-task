import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from '@infra/database/database.module';
import { configValidationSchema } from '@shared/env/config.schema';
import { NodeEnvironment } from '@shared/env/node-env.enum';
import { BullModule } from '@nestjs/bullmq';
import { QueueOptions } from 'bullmq';
import { UploadFileModule } from './upload-file/upload-file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.getOrThrow<NodeEnvironment>('NODE_ENV');

        return {
          pinoHttp: {
            level: 'info',
            transport:
              nodeEnv === NodeEnvironment.LOCAL
                ? { target: 'pino-pretty' }
                : undefined,
          },
        };
      },
    }),
    DatabaseModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): QueueOptions => {
        return {
          connection: {
            host: configService.getOrThrow<string>('REDIS_HOST'),
            port: configService.getOrThrow<number>('REDIS_PORT'),
            db: configService.getOrThrow<number>('REDIS_BULLMQ_DB'),
            username: configService.get<string>('REDIS_USER'),
            password: configService.get<string>('REDIS_PASSWORD'),
            tls: configService.getOrThrow<boolean>('REDIS_TLS_ENABLED')
              ? { rejectUnauthorized: false }
              : undefined,
          },
        };
      },
    }),
    UploadFileModule,
  ],
})
export class AppModule {}
