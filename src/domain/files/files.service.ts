import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema, Schema } from '@infra/database/schema';
import { desc, getTableColumns, sql } from 'drizzle-orm';
import { File } from '@domain/files/entities/file.entity';
import { ResultAsync } from 'neverthrow';
import { PaginationQueryDto } from '@shared/pagination/pagination-query.dto';
import { PaginatedResult } from '@shared/pagination/paginated-result.type';
import { getPaginationMeta } from '@shared/pagination/get-pagination-meta.util';

export type FindAllFilesError = { type: 'DATABASE_ERROR'; error: unknown };

export class FilesService {
  constructor(private readonly db: NodePgDatabase<Schema>) {}

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
}
