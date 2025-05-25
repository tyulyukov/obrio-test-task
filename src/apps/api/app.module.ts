import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { FilesModule } from './files/files.module';
import { DatabaseModule } from '@infra/database/database.module';
import { configValidationSchema } from '@shared/env/config.schema';
import { NodeEnvironment } from '@shared/env/node-env.enum';
import { BullModule } from '@nestjs/bullmq';
import { QueueOptions } from 'bullmq';

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
    DatabaseModule,
    FilesModule,
  ],
})
export class AppModule {}
