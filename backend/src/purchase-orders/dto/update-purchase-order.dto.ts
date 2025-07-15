import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDateString, 
  IsArray, 
  ValidateNested,
  IsIn
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UpdatePurchaseOrderLineItemDto } from './update-purchase-order-line-item.dto';

export class UpdatePurchaseOrderDto {
  @ApiProperty({
    description: 'Name of the vendor',
    example: 'ABC Suppliers Inc.',
    required: false,
  })
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiProperty({
    description: 'One-time vendor name (if applicable)',
    example: 'XYZ Temporary Vendor',
    required: false,
  })
  @IsOptional()
  @IsString()
  oneTimeVendor?: string;

  @ApiProperty({
    description: 'Purchase Order date',
    example: '2025-07-14',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value).toISOString().split('T')[0] : undefined)
  poDate?: string;

  @ApiProperty({
    description: 'Purchase Order number (must be unique)',
    example: 'PO-2025-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  poNumber?: string;

  @ApiProperty({
    description: 'Customer Sales Order number',
    example: 'SO-2025-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerSO?: string;

  @ApiProperty({
    description: 'Customer Invoice number',
    example: 'INV-2025-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerInvoice?: string;

  @ApiProperty({
    description: 'Accounts Payable account',
    example: 'Trade Creditors',
    required: false,
  })
  @IsOptional()
  @IsString()
  apAccount?: string;

  @ApiProperty({
    description: 'Type of transaction',
    example: 'Goods',
    required: false,
    enum: ['Goods', 'Services'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['Goods', 'Services'], { message: 'Transaction type must be either "Goods" or "Services"' })
  transactionType?: string;

  @ApiProperty({
    description: 'Origin of the transaction',
    example: 'Local',
    required: false,
    enum: ['Local', 'Imported'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['Local', 'Imported'], { message: 'Transaction origin must be either "Local" or "Imported"' })
  transactionOrigin?: string;

  @ApiProperty({
    description: 'Shipping method',
    example: "Customer's Vehicle",
    required: false,
    enum: ["Customer's Vehicle", "Company Vehicle", "Courier", "Mail"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["Customer's Vehicle", "Company Vehicle", "Courier", "Mail"], { 
    message: 'Ship via must be one of: "Customer\'s Vehicle", "Company Vehicle", "Courier", "Mail"' 
  })
  shipVia?: string;

  @ApiProperty({
    description: 'Status of the purchase order',
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
    description: 'Array of line items for the purchase order',
    type: [UpdatePurchaseOrderLineItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseOrderLineItemDto)
  lineItems?: UpdatePurchaseOrderLineItemDto[];
}