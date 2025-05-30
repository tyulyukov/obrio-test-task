import { ApiProperty } from '@nestjs/swagger';
import { File } from '@domain/files/entities/file.entity';

export class FileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'Original URL of the file',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'Actual URL of the file',
    nullable: true,
  })
  url: string | null;

  @ApiProperty()
  isUploaded: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  constructor(file: File) {
    this.id = file.id;
    this.originalUrl = file.originalUrl;
    this.url = file.url;
    this.isUploaded = !!file.url;
    this.createdAt = file.createdAt;
    this.updatedAt = file.updatedAt;
  }
}
