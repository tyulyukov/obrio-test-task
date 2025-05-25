import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesService } from '@domain/files/files.service';
import { FileResponseDto } from './dto/file.response.dto';
import { ApiPaginatedResponse } from '@shared/pagination/api-paginated-response.decorator';
import { PaginationQueryDto } from '@shared/pagination/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/pagination/pagination-response.dto';
import { UploadFilesDto } from './dto/upload-files.dto';
import { FindFileByIdParamsDto } from '@api/files/dto/find-file-by-id.params.dto';

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

  @Get(':id')
  @ApiOperation({ summary: 'Get a file by ID' })
  @ApiResponse({
    status: 200,
    description: 'The file was found',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async findById(
    @Param() { id }: FindFileByIdParamsDto,
  ): Promise<FileResponseDto> {
    const result = await this.filesService.getFileById(id);

    return result.match(
      (file) => {
        return new FileResponseDto(file);
      },
      (e) => {
        switch (e.type) {
          case 'DATABASE_ERROR':
            this.logger.error(e.error);
            throw new InternalServerErrorException();
          case 'FILE_NOT_FOUND':
            throw new NotFoundException(`File with ID ${id} not found`);
        }
      },
    );
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload files from URLs' })
  @ApiResponse({
    status: 201,
    description: 'The files have been successfully scheduled for upload.',
    type: [FileResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'At least one of the provided URLs is not valid.',
  })
  @ApiResponse({
    status: 409,
    description: 'One or more files already exist in the database.',
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
          case 'FILE_ALREADY_EXISTS':
            throw new ConflictException(
              `Files with the following URLs already exist: ${e.urls.join(', ')}`,
            );
          case 'URL_NOT_VALID':
            throw new BadRequestException(
              `At lest one of the provided URLs is not valid`,
            );
        }
      },
    );
  }
}
