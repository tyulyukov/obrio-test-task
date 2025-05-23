import { FilesService } from './files.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Schema } from '@infra/database/schema';

export const createFilesService = (db: NodePgDatabase<Schema>): FilesService => {
  return new FilesService(db);
};
