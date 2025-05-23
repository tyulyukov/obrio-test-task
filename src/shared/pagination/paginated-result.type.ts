import { PaginationMeta } from '@shared/pagination/get-pagination-meta.util';

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginationMeta;
};
