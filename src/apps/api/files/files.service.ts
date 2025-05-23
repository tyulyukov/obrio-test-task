import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_PROVIDER } from '@infra/database/database.module';
import { schema, Schema } from '@infra/database/schema';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { sql } from 'drizzle-orm';
import { getPaginationMeta } from '@shared/utils/get-pagination-meta';

@Injectable()
export class FilesService {
  constructor(
    @Inject(DATABASE_PROVIDER)
    private readonly db: NodePgDatabase<Schema>,
  ) {}

  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery;
    const offset = (page - 1) * limit;

    const [data, totalResult] = await Promise.all([
      this.db
        .select()
        .from(schema.files)
        .limit(limit)
        .offset(offset)
        .orderBy(schema.files.createdAt),
      this.db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(schema.files),
    ]);

    return {
      data,
      meta: getPaginationMeta(totalResult[0].count, page, limit),
    };
  }
}
