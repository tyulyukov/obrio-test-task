import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QueueName } from '@shared/constants/queue-name.enum';
import { Job } from 'bullmq';

@Processor({ name: QueueName.UPLOAD_FILE })
export class UploadFileConsumer extends WorkerHost {
  async process(job: Job<any, any, string>) {
    console.log(job.data);
  }
}
