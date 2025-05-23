import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { createFilesService } from '@domain/files/files.module';
import { FilesService } from '@domain/files/files.service';
import {
  DATABASE_PROVIDER,
  DatabaseModule,
} from '@infra/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Schema } from '@infra/database/schema';

@Module({
  imports: [DatabaseModule],
  controllers: [FilesController],
  providers: [
    {
      provide: FilesService,
      useFactory: (db: NodePgDatabase<Schema>) => createFilesService(db),
      inject: [DATABASE_PROVIDER],
    },
  ],
})
export class FilesModule {}
