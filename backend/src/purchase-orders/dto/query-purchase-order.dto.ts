import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

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
}