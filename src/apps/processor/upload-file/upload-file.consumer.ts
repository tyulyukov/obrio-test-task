import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QueueName } from '@shared/constants/queue-name.enum';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { StorageService } from '@infra/storage/storage.service';
import { FilesService } from '@domain/files/files.service';
import { Readable } from 'stream';

export interface UploadFileJobData {
  fileId: string;
}

@Processor({ name: QueueName.UPLOAD_FILE })
export class UploadFileConsumer extends WorkerHost {
  private readonly logger = new Logger(UploadFileConsumer.name);

  constructor(
    private readonly filesService: FilesService,
    private readonly storageService: StorageService,
  ) {
    super();
  }

  async process(job: Job<UploadFileJobData>) {
    const { fileId } = job.data;
    this.logger.log({ fileId }, 'Processing file upload');

    try {
      const file = await this.filesService.getFileById(fileId).match(
        (file) => file,
        (error) => {
          if (error.type === 'FILE_NOT_FOUND') {
            throw new Error(`File not found`);
          }
          throw error.error;
        },
      );

      this.logger.log({ file }, 'Found file');

      const response = await fetch(file.originalUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to download file ${file.id}: ${response.statusText}`,
        );
      }

      // convert WHATWG stream
      const bodyStream = Readable.fromWeb(response.body as any);

      const filename = `${Date.now()}-${file.id}`;
      const contentType = response.headers.get('content-type') || undefined;

      this.logger.log(
        {
          file,
          filename,
          contentType,
        },
        'Uploading file to Google Drive',
      );

      // pass the stream straight to the Google Drive API without saving the whole file into RAM
      const driveUrl = await this.storageService
        .upload(bodyStream, filename, contentType)
        .match(
          (url) => url,
          (error) => {
            throw error.error;
          },
        );

      this.logger.log({ file, driveUrl }, 'File uploaded successfully');

      await this.filesService.updateFileUrl(fileId, driveUrl).match(
        () => {
          this.logger.log(
            {
              fileId,
              url: driveUrl,
            },
            `File record updated with new URL`,
          );
        },
        (error) => {
          if (error.type === 'FILE_NOT_FOUND') {
            throw new Error(`File not found`);
          }

          throw error.error;
        },
      );
    } catch (error) {
      error.fileId = fileId;
      this.logger.error(error, `Error processing file upload`);
    }
  }
}
