import { ApiProperty } from '@nestjs/swagger';

export class StructuredError {
  @ApiProperty()
  code: string | null = null;

  @ApiProperty()
  message: string | null = null;

  @ApiProperty()
  details?: any;
}

// Response base
export class ApiResponseBase {
  @ApiProperty()
  success?: boolean = false;

  @ApiProperty({ nullable: true })
  error?: StructuredError | null = null;

  @ApiProperty({ nullable: true })
  data?: any;
}

// Generic Response with data
export class ApiResponse<T> extends ApiResponseBase {
  @ApiProperty({ type: () => Object, nullable: true })
  override data: T | null = null;
}

export class ApiStringResponse extends ApiResponseBase {
  @ApiProperty({ type: () => String, nullable: true })
  override data: string | null = null;
}

export class ApiBooleanResponse extends ApiResponseBase {
  @ApiProperty({ type: () => Boolean, nullable: true })
  override data: boolean | null = null;
}

// Generic Paginated Response with data
export class ApiPaginatedResponse<T = any> extends ApiResponseBase {
  @ApiProperty({ type: () => [Object], nullable: true })
  override data: T[] | null = null;

  @ApiProperty()
  count?: number = 0;

  @ApiProperty()
  page?: number = 0;

  @ApiProperty()
  totalPages?: number = 0;
}
