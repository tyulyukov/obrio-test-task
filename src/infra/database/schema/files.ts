import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestampsColumns } from '@infra/database/helpers/timestamps-columns';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const files = pgTable('files', {
  id: uuid().primaryKey().defaultRandom(),
  originalUrl: text().notNull(),
  url: text(),
  ...timestampsColumns,
});

export type SelectFile = InferSelectModel<typeof files>;
export type InsertFile = InferInsertModel<typeof files>;
