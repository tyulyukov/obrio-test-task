import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FindFileByIdParamsDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}
