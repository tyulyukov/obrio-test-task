import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema, Schema } from '@infra/database/schema';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { File } from '@domain/files/entities/file.entity';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
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
import { normalizeUrl } from '@shared/libs/normalize-url';
import { UploadFileJobData } from '../../apps/processor/upload-file/upload-file.consumer';

export type FindAllFilesError = { type: 'DATABASE_ERROR'; error: unknown };
export type UploadFilesError =
  | {
      type: 'DATABASE_ERROR';
      error: unknown;
    }
  | { type: 'QUEUE_ERROR'; error: unknown }
  | { type: 'URL_NOT_VALID'; error: unknown }
  | { type: 'FILE_ALREADY_EXISTS'; urls: string[] };

export type GetFileByIdError =
  | { type: 'DATABASE_ERROR'; error: unknown }
  | { type: 'FILE_NOT_FOUND'; fileId: string };

export type UpdateFileUrlError =
  | { type: 'DATABASE_ERROR'; error: unknown }
  | { type: 'FILE_NOT_FOUND'; fileId: string };

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

  public getFileById(fileId: string): ResultAsync<File, GetFileByIdError> {
    return ResultAsync.fromPromise(
      this.db
        .select()
        .from(schema.files)
        .where(eq(schema.files.id, fileId))
        .then((files) => files[0]),
      (error: unknown): GetFileByIdError => ({
        type: 'DATABASE_ERROR',
        error,
      }),
    ).andThen((file) => {
      if (!file) {
        return errAsync<File, GetFileByIdError>({
          type: 'FILE_NOT_FOUND',
          fileId,
        });
      }

      return okAsync(file);
    });
  }

  public updateFileUrl(
    fileId: string,
    url: string,
  ): ResultAsync<void, UpdateFileUrlError> {
    return ResultAsync.fromPromise(
      this.db
        .update(schema.files)
        .set({ url })
        .where(eq(schema.files.id, fileId))
        .returning({ updatedId: schema.files.id }),
      (error: unknown): UpdateFileUrlError => ({
        type: 'DATABASE_ERROR',
        error,
      }),
    ).andThen((files) => {
      if (!files.length || !files[0].updatedId) {
        return errAsync<void, UpdateFileUrlError>({
          type: 'FILE_NOT_FOUND',
          fileId,
        });
      }

      return okAsync();
    });
  }

  public uploadFiles(
    dto: UploadFilesDto,
  ): ResultAsync<File[], UploadFilesError> {
    const normalizeUrls = ResultAsync.fromPromise(
      Promise.resolve(
        Array.from(new Set(dto.urls.map((u) => normalizeUrl(u.trim())))),
      ),
      (e): UploadFilesError => ({ type: 'URL_NOT_VALID', error: e }),
    );

    return normalizeUrls.andThen((originalUrls) =>
      runInTransactionWithResult(this.db, (tx) =>
        this.findExistingOriginalUrls(tx, originalUrls).andThen(
          (existingUrls) => {
            if (existingUrls.length > 0) {
              return errAsync<File[], UploadFilesError>({
                type: 'FILE_ALREADY_EXISTS',
                urls: existingUrls,
              });
            }

            return ResultAsync.fromPromise(
              tx
                .insert(schema.files)
                .values(originalUrls.map((url) => ({ originalUrl: url })))
                .returning(),
              (e): UploadFilesError => ({ type: 'DATABASE_ERROR', error: e }),
            ).andThen((files) => this.queueFileUploads(files).map(() => files));
          },
        ),
      ),
    );
  }

  private findExistingOriginalUrls(
    tx: NodePgDatabase<Schema>,
    urls: string[],
  ): ResultAsync<string[], UploadFilesError> {
    return ResultAsync.fromPromise(
      tx
        .select({ originalUrl: schema.files.originalUrl })
        .from(schema.files)
        .where(sql`${schema.files.originalUrl} IN ${urls}`),
      (e): UploadFilesError => ({ type: 'DATABASE_ERROR', error: e }),
    ).map((existingFiles) => existingFiles.map((file) => file.originalUrl));
  }

  private queueFileUploads(files: File[]): ResultAsync<void, UploadFilesError> {
    return ResultAsync.fromPromise(
      this.uploadFilesQueue.addBulk(
        files.map((file) => ({
          name: QueueName.UPLOAD_FILE,
          data: { fileId: file.id } as UploadFileJobData,
          opts: { removeOnComplete: true },
        })),
      ),
      (e): UploadFilesError => ({ type: 'QUEUE_ERROR', error: e }),
    ).map(() => {});
  }
}
