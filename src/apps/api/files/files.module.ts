import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesModule as DomainFilesModule } from '@domain/files/files.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DomainFilesModule,
    ConfigModule,
  ],
  controllers: [FilesController],
})
export class FilesModule {}
