import { DynamicModule, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { GoogleDriveProvider } from './providers/google-drive.provider';
import { StorageOptions } from './storage.interface';
import { ConfigService } from '@nestjs/config';

const STORAGE_OPTIONS_PROVIDER = 'STORAGE_OPTIONS';

@Module({})
export class StorageModule {
  static register(options?: StorageOptions): DynamicModule {
    const optionsProvider = options
      ? {
          provide: STORAGE_OPTIONS_PROVIDER,
          useValue: options,
        }
      : {
          provide: STORAGE_OPTIONS_PROVIDER,
          useFactory: (configService: ConfigService): StorageOptions => ({
            googleDrive: {
              clientEmail: configService.getOrThrow<string>(
                'GOOGLE_DRIVE_CLIENT_EMAIL',
              ),
              privateKey: configService.getOrThrow<string>(
                'GOOGLE_DRIVE_PRIVATE_KEY',
              ),
            },
            redis: {
              host: configService.getOrThrow<string>('REDIS_HOST'),
              port: configService.getOrThrow<number>('REDIS_PORT'),
              user: configService.get<string>('REDIS_USER'),
              password: configService.get<string>('REDIS_PASSWORD'),
              db: configService.getOrThrow<number>('REDIS_BOTTLENECK_DB'),
              tlsEnabled:
                configService.getOrThrow<boolean>('REDIS_TLS_ENABLED'),
            },
            bottleneck: {
              maxConcurrent: configService.getOrThrow<number>(
                'GOOGLE_DRIVE_BOTTLENECK_MAX_CONCURRENT',
              ),
              minTime: configService.getOrThrow<number>(
                'GOOGLE_DRIVE_BOTTLENECK_MIN_TIME',
              ),
            },
          }),
          inject: [ConfigService],
        };

    return {
      module: StorageModule,
      imports: [],
      providers: [
        optionsProvider,
        {
          provide: GoogleDriveProvider,
          useFactory: (options: StorageOptions) => {
            return new GoogleDriveProvider(options);
          },
          inject: [STORAGE_OPTIONS_PROVIDER],
        },
        {
          provide: StorageService,
          useFactory: (
            options: StorageOptions,
            storageProvider: GoogleDriveProvider,
          ) => {
            return new StorageService(options, storageProvider);
          },
          inject: [STORAGE_OPTIONS_PROVIDER, GoogleDriveProvider],
        },
      ],
      exports: [StorageService],
    };
  }
}
