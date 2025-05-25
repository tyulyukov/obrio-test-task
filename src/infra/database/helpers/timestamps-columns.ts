import { timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const timestampsColumns = {
  createdAt: timestamp({ withTimezone: true, mode: 'string' })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: 'string' })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull()
    .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
};
