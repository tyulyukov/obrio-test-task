import { Injectable } from '@nestjs/common';
import { StorageOptions, StorageProvider } from './storage.interface';
import { ResultAsync } from 'neverthrow';
import { Readable } from 'stream';
import Bottleneck from 'bottleneck';
import { RedisOptions } from 'bullmq';

export type UploadFileError = { type: 'UPLOAD_ERROR'; error: unknown };

@Injectable()
export class StorageService {
  private readonly limiter: Bottleneck;

  constructor(
    options: StorageOptions,
    private readonly storageProvider: StorageProvider,
  ) {
    this.limiter = new Bottleneck({
      maxConcurrent: options.bottleneck.maxConcurrent,
      minTime: options.bottleneck.minTime,
      datastore: 'redis',
      clientOptions: {
        host: options.redis.host,
        port: options.redis.port,
        username: options.redis.user,
        password: options.redis.password,
        db: options.redis.db,
        tls: options.redis.tlsEnabled
          ? { rejectUnauthorized: false }
          : undefined,
      } as RedisOptions,
      id: 'google-drive-limiter',
    });
  }

  public upload(
    file: Buffer | Readable,
    filename: string,
    mimeType?: string,
  ): ResultAsync<string, UploadFileError> {
    return ResultAsync.fromPromise(
      this.limiter.schedule(async () => {
        return await this.storageProvider.upload(file, filename, mimeType);
      }),
      (error: unknown): UploadFileError => {
        return {
          type: 'UPLOAD_ERROR',
          error,
        };
      },
    );
  }
}
