import { Readable } from 'stream';

export interface StorageProvider {
  upload(
    file: Buffer | Readable,
    filename: string,
    mimeType?: string,
  ): Promise<string>;
}

export interface StorageOptions {
  googleDrive: {
    clientEmail: string;
    privateKey: string;
  };
  redis: {
    host: string;
    port: number;
    user?: string;
    password?: string;
    db: number;
    tlsEnabled?: boolean;
  };
  bottleneck: {
    maxConcurrent: number;
    minTime: number;
  };
}
