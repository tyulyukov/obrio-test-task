import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from '@infra/database/helpers/timestamps';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const files = pgTable('files', {
  id: uuid().primaryKey().defaultRandom(),
  originalUrl: text().notNull(),
  url: text().notNull(),
  ...timestamps,
});

export type SelectFile = InferSelectModel<typeof files>;
export type InsertFile = InferInsertModel<typeof files>;
