import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema, Schema } from '@infra/database/schema';
import { desc, getTableColumns, sql } from 'drizzle-orm';
import { File } from '@domain/files/entities/file.entity';
import { ResultAsync } from 'neverthrow';
import { PaginationQueryDto } from '@shared/pagination/pagination-query.dto';
import { PaginatedResult } from '@shared/pagination/paginated-result.type';
import { getPaginationMeta } from '@shared/pagination/get-pagination-meta.util';
import { Queue } from 'bullmq';
import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_PROVIDER } from '@infra/database/database.module';
import { QueueName } from '@shared/constants/queue-name.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { UploadFilesDto } from '@api/files/dto/upload-files.dto';
import { runInTransactionWithResult } from '@infra/database/helpers/run-in-transaction-with-result.util';

export type FindAllFilesError = { type: 'DATABASE_ERROR'; error: unknown };
export type UploadFilesError =
  | {
      type: 'DATABASE_ERROR';
      error: unknown;
    }
  | { type: 'QUEUE_ERROR'; error: unknown };

@Injectable()
export class FilesService {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: NodePgDatabase<Schema>,
    @InjectQueue(QueueName.UPLOAD_FILE)
    private readonly uploadFilesQueue: Queue,
  ) {}

  public findAll({
    page = 1,
    limit = 10,
  }: PaginationQueryDto): ResultAsync<
    PaginatedResult<File>,
    FindAllFilesError
  > {
    const offset = (page - 1) * limit;

    return ResultAsync.fromPromise(
      this.db
        .select({
          ...getTableColumns(schema.files),
          total: sql<number>`count(*) OVER ()`.mapWith(Number),
        })
        .from(schema.files)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(schema.files.createdAt)),
      (error: unknown): FindAllFilesError => ({
        type: 'DATABASE_ERROR',
        error,
      }),
    ).map((data) => ({
      data,
      meta: getPaginationMeta(data[0]?.total ?? 0, page, limit),
    }));
  }

  public uploadFiles(
    dto: UploadFilesDto,
  ): ResultAsync<File[], UploadFilesError> {
    return runInTransactionWithResult(this.db, (tx) =>
      ResultAsync.fromPromise(
        tx
          .insert(schema.files)
          .values(dto.urls.map((u) => ({ originalUrl: u })))
          .returning(),
        (e): UploadFilesError => ({ type: 'DATABASE_ERROR', error: e }),
      ).andThen((files: File[]) =>
        ResultAsync.fromPromise(
          this.uploadFilesQueue.addBulk(
            files.map((f) => ({
              name: QueueName.UPLOAD_FILE,
              data: { fileId: f.id, originalUrl: f.originalUrl },
              opts: { removeOnComplete: true },
            })),
          ),
          (e): UploadFilesError => ({ type: 'QUEUE_ERROR', error: e }),
        ).map(() => files),
      ),
    );
  }
}
