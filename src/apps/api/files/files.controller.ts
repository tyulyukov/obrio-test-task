import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesService } from '@domain/files/files.service';
import { FileResponseDto } from './dto/file-response.dto';
import { ApiPaginatedResponse } from '@shared/pagination/api-paginated-response.decorator';
import { PaginationQueryDto } from '@shared/pagination/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/pagination/pagination-response.dto';
import { UploadFilesDto } from './dto/upload-files.dto';

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

  @Post()
  @ApiOperation({ summary: 'Upload files from URLs' })
  @ApiResponse({
    status: 201,
    description: 'The files have been successfully scheduled for upload.',
    type: [FileResponseDto],
  })
  async uploadFiles(
    @Body() uploadFilesDto: UploadFilesDto,
  ): Promise<FileResponseDto[]> {
    const result = await this.filesService.uploadFiles(uploadFilesDto);

    return result.match(
      (files) => {
        return files.map((file) => new FileResponseDto(file));
      },
      (e) => {
        switch (e.type) {
          case 'DATABASE_ERROR':
            this.logger.error(e.error);
            throw new InternalServerErrorException();
          case 'QUEUE_ERROR':
            this.logger.error(e.error);
            throw new InternalServerErrorException();
        }
      },
    );
  }
}
