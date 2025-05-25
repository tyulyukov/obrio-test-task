import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { DatabaseModule } from '@infra/database/database.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueName } from '@shared/constants/queue-name.enum';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: QueueName.UPLOAD_FILE,
    }),
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
