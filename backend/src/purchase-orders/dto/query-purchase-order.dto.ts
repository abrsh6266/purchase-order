import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryPurchaseOrderDto {
  @ApiProperty({
    description: 'Search term for PO number, vendor name, or customer SO',
    example: 'ABC Suppliers',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Start date for filtering (inclusive)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value).toISOString().split('T')[0] : undefined)
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering (inclusive)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value).toISOString().split('T')[0] : undefined)
  endDate?: string;

  @ApiProperty({
    description: 'Status filter',
    example: 'DRAFT',
    required: false,
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'], { 
    message: 'Status must be one of: DRAFT, SUBMITTED, APPROVED, REJECTED, COMPLETED, CANCELLED' 
  })
  status?: string;

  @ApiProperty({
    description: 'Page number for pagination (starts from 1)',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort by field',
    example: 'createdAt',
    required: false,
    enum: ['createdAt', 'poDate', 'poNumber', 'vendorName', 'totalAmount', 'status'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'poDate', 'poNumber', 'vendorName', 'totalAmount', 'status'], {
    message: 'Sort by must be one of: createdAt, poDate, poNumber, vendorName, totalAmount, status'
  })
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'Sort order must be either "asc" or "desc"' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}