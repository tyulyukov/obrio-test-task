import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesModule as DomainFilesModule } from '@domain/files/files.module';

@Module({
  imports: [DomainFilesModule],
  controllers: [FilesController],
})
export class FilesModule {}
