import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UploadFileConsumer } from './upload-file.consumer';
import { QueueName } from '@shared/constants/queue-name.enum';
import { FilesModule as DomainFilesModule } from '@domain/files/files.module';
import { StorageModule } from '@infra/storage/storage.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: QueueName.UPLOAD_FILE }),
    DomainFilesModule,
    StorageModule.register(),
  ],
  providers: [UploadFileConsumer],
})
export class UploadFileModule {}
