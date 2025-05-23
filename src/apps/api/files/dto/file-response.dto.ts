import { ApiProperty } from '@nestjs/swagger';
import { SelectFile } from '@infra/database/schema/files';

export class FileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'Original URL of the file',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'Actual URL of the file',
  })
  url: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  constructor(file: SelectFile) {
    this.id = file.id;
    this.originalUrl = file.originalUrl;
    this.url = file.url;
    this.createdAt = file.createdAt;
    this.updatedAt = file.updatedAt;
  }
}
