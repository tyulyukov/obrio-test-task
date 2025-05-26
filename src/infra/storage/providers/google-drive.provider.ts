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
    const { data } = await this.drive.files.create({
      uploadType: 'resumable',
      fields: 'id,webViewLink',
      requestBody: { name: filename, mimeType },
      media: { mimeType, body: file },
    });

    if (!data.id || !data.webViewLink) {
      throw new Error('drive upload failed');
    }

    await this.drive.permissions.create({
      fileId: data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return data.webViewLink;
  }
}
