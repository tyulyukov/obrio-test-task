import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import {
  PaginatedResponseDto,
  PaginationMetaResponseDto,
} from '@shared/pagination/pagination-response.dto';

/**
 * Custom decorator to standardize paginated API responses.
 * @param dataType The class of the data items.
 */
export function ApiPaginatedResponse<T>(dataType: Type<T>) {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, dataType, PaginationMetaResponseDto),
    ApiOkResponse({
      description: 'Paginated response',
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataType) },
              },
            },
          },
        ],
      },
    }),
  );
}
