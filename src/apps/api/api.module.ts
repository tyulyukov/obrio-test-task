import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { FilesModule } from './files/files.module';
import { DatabaseModule } from '@infra/database/database.module';
import { configValidationSchema } from '@shared/config/config.schema';
import { NodeEnvironment } from '@shared/enums/node-env.enum';

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
    FilesModule,
  ],
})
export class ApiModule {}
