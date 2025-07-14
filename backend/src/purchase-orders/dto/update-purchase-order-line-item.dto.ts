import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsPositive, IsUUID, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePurchaseOrderLineItemDto {
    @ApiProperty({
        description: 'ID of the line item (for existing items)',
        example: '550e8400-e29b-41d4-a716-446655440000',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    id?: string;

    @ApiProperty({
        description: 'Name of the item',
        example: 'Office Supplies',
        required: false,
    })
    @IsOptional()
    @IsString()
    itemName?: string;

    @ApiProperty({
        description: 'Quantity of the item',
        example: 10.5,
        required: false,
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Quantity must be a number with at most 2 decimal places' })
    @IsPositive()
    @Transform(({ value }) => value ? parseFloat(value) : value)
    quantity?: number;

    @ApiProperty({
        description: 'Unit price of the item',
        example: 25.99,
        required: false,
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Unit price must be a number with at most 2 decimal places' })
    @IsPositive()
    @Transform(({ value }) => value ? parseFloat(value) : value)
    unitPrice?: number;

    @ApiProperty({
        description: 'Description of the item',
        example: 'High-quality office supplies for the team',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'GL Account Name for the item',
        example: 'Office Expenses',
        required: false,
    })
    @IsOptional()
    @IsString()
    glAccountName?: string;

    @ApiProperty({
        description: 'Flag to indicate if this line item should be deleted',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    _delete?: boolean;
}