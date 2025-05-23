import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesService } from '@domain/files/files.service';
import { FileResponseDto } from './dto/file-response.dto';
import { ApiPaginatedResponse } from '@shared/pagination/api-paginated-response.decorator';
import { PaginationQueryDto } from '@shared/pagination/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/pagination/pagination-response.dto';

@ApiTags('files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all files with pagination' })
  @ApiPaginatedResponse(FileResponseDto)
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<FileResponseDto>> {
    const result = await this.filesService.findAll(paginationQuery);

    return result.match(
      ({ data, meta }) => {
        return new PaginatedResponseDto({
          data: data.map((e) => new FileResponseDto(e)),
          meta,
        });
      },
      (e) => {
        switch (e.type) {
          case 'DATABASE_ERROR':
            this.logger.error(e.error);
            throw new InternalServerErrorException();
        }
      },
    );
  }
}
