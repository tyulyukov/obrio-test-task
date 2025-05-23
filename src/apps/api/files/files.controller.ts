import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FileResponseDto } from './dto/file-response.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { ApiPaginatedResponse } from '@shared/decorators/api-paginated-response.decorator';

@ApiTags('files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all files with pagination' })
  @ApiPaginatedResponse(FileResponseDto)
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<FileResponseDto>> {
    const { data, meta } = await this.filesService.findAll(paginationQuery);
    return new PaginatedResponseDto({
      data: data.map((e) => new FileResponseDto(e)),
      meta,
    });
  }
}
