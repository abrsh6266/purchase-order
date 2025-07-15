import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateGLAccountDto {
  @ApiProperty({
    description: 'Account code (unique identifier)',
    example: '1000',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty({ message: 'Account code is required' })
  @MaxLength(20, { message: 'Account code cannot exceed 20 characters' })
  accountCode: string;

  @ApiProperty({
    description: 'Account name',
    example: 'Cash',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Account name is required' })
  @MaxLength(255, { message: 'Account name cannot exceed 255 characters' })
  accountName: string;

  @ApiProperty({
    description: 'Account description',
    example: 'Cash and cash equivalents',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
} 