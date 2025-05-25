import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UploadFileConsumer } from './upload-file.consumer';
import { DatabaseModule } from '@infra/database/database.module';
import { QueueName } from '@shared/constants/queue-name.enum';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({ name: QueueName.UPLOAD_FILE }),
  ],
  providers: [UploadFileConsumer],
})
export class UploadFileModule {}
