import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsUrl } from 'class-validator';

export class UploadFilesDto {
  @ApiProperty({
    description: 'URLs of the files to upload',
    type: [String],
    example: ['https://example.com/file1.jpg', 'https://example.com/file2.pdf'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUrl({}, { each: true })
  urls: string[];
}
