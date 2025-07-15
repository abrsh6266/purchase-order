import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateGLAccountDto {
  @ApiProperty({
    description: 'Account code (unique identifier)',
    example: '1000',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Account code cannot exceed 20 characters' })
  accountCode?: string;

  @ApiProperty({
    description: 'Account name',
    example: 'Cash',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Account name cannot exceed 255 characters' })
  accountName?: string;

  @ApiProperty({
    description: 'Account description',
    example: 'Cash and cash equivalents',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
} 