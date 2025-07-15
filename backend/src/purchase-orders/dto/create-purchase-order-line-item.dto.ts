import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreatePurchaseOrderLineItemDto {
    @ApiProperty({
        description: 'Name of the item',
        example: 'Office Supplies',
    })
    @IsString()
    @IsNotEmpty()
    item: string;

    @ApiProperty({
        description: 'Quantity of the item',
        example: 10.5,
    })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Quantity must be a number with at most 2 decimal places' })
    @IsPositive()
    @Transform(({ value }) => parseFloat(value))
    quantity: number;

    @ApiProperty({
        description: 'Unit price of the item',
        example: 25.99,
    })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Unit price must be a number with at most 2 decimal places' })
    @IsPositive()
    @Transform(({ value }) => parseFloat(value))
    unitPrice: number;

    @ApiProperty({
        description: 'Description of the item',
        example: 'High-quality office supplies for the team',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'GL Account ID for the item',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    @IsNotEmpty()
    glAccountId: string;
}