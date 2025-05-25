import { Injectable } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import {
  StorageOptions,
  StorageProvider,
} from '@infra/storage/storage.interface';

@Injectable()
export class GoogleDriveProvider implements StorageProvider {
  private readonly drive: drive_v3.Drive;

  constructor(options: StorageOptions) {
    const auth = new google.auth.JWT({
      email: options.googleDrive.clientEmail,
      key: options.googleDrive.privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async upload(
    file: Buffer | Readable,
    filename: string,
    mimeType = 'application/octet-stream',
  ): Promise<string> {
    const media = {
      body: file instanceof Buffer ? Readable.from(file) : file,
    };

    const res = await this.drive.files.create({
      requestBody: {
        name: filename,
        mimeType,
      },
      media,
      fields: 'webViewLink',
    });

    if (!res.data.webViewLink) {
      throw new Error('Google Drive upload failed (no file url returned)');
    }

    return res.data.webViewLink;
  }
}
