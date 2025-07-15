import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
import { PaginatedResponse } from '../common/types/pagination';
import { PurchaseOrder } from '@prisma/client';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new Purchase Order',
    description: 'Creates a new Purchase Order with associated line items. The PO number must be unique.'
  })
  @ApiBody({ type: CreatePurchaseOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Purchase Order created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        vendorName: 'ABC Suppliers Inc.',
        oneTimeVendor: null,
        poDate: '2025-07-14',
        poNumber: 'PO-2025-001',
        customerSO: 'SO-2025-001',
        customerInvoice: null,
        apAccount: 'Trade Creditors',
        transactionType: 'Goods',
        transactionOrigin: 'Local',
        shipVia: "Customer's Vehicle",
        status: 'DRAFT',
        totalAmount: '259.90',
        createdAt: '2025-07-14T10:30:00.000Z',
        updatedAt: '2025-07-14T10:30:00.000Z',
        lineItems: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            purchaseOrderId: '550e8400-e29b-41d4-a716-446655440000',
            item: 'Office Supplies',
            quantity: '10.00',
            unitPrice: '25.99',
            description: 'High-quality office supplies',
            glAccount: 'Office Expenses',
            amount: '259.90',
            createdAt: '2025-07-14T10:30:00.000Z',
            updatedAt: '2025-07-14T10:30:00.000Z'
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: ['vendorName should not be empty', 'At least one line item is required'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - PO number already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Purchase Order with number PO-2025-001 already exists',
        error: 'Conflict'
      }
    }
  })
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(createPurchaseOrderDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all Purchase Orders',
    description: 'Retrieves a paginated list of Purchase Orders with optional filtering, searching, and sorting capabilities.'
  })
  @ApiQuery({ type: QueryPurchaseOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of Purchase Orders retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            vendorName: 'ABC Suppliers Inc.',
            oneTimeVendor: null,
            poDate: '2025-07-14',
            poNumber: 'PO-2025-001',
            customerSO: 'SO-2025-001',
            customerInvoice: null,
            apAccount: 'Trade Creditors',
            transactionType: 'Goods',
            transactionOrigin: 'Local',
            shipVia: "Customer's Vehicle",
            status: 'DRAFT',
            totalAmount: '259.90',
            createdAt: '2025-07-14T10:30:00.000Z',
            updatedAt: '2025-07-14T10:30:00.000Z',
            lineItems: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                purchaseOrderId: '550e8400-e29b-41d4-a716-446655440000',
                item: 'Office Supplies',
                quantity: '10.00',
                unitPrice: '25.99',
                description: 'High-quality office supplies',
                glAccount: 'Office Expenses',
                amount: '259.90',
                createdAt: '2025-07-14T10:30:00.000Z',
                updatedAt: '2025-07-14T10:30:00.000Z'
              }
            ]
          }
        ],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3
      }
    }
  })
  findAll(@Query() query: QueryPurchaseOrderDto): Promise<PaginatedResponse<PurchaseOrder>> {
    return this.purchaseOrdersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a specific Purchase Order',
    description: 'Retrieves details of a specific Purchase Order by its ID, including all line items.'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the Purchase Order',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase Order retrieved successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        vendorName: 'ABC Suppliers Inc.',
        oneTimeVendor: null,
        poDate: '2025-07-14',
        poNumber: 'PO-2025-001',
        customerSO: 'SO-2025-001',
        customerInvoice: null,
        apAccount: 'Trade Creditors',
        transactionType: 'Goods',
        transactionOrigin: 'Local',
        shipVia: "Customer's Vehicle",
        status: 'DRAFT',
        totalAmount: '259.90',
        createdAt: '2025-07-14T10:30:00.000Z',
        updatedAt: '2025-07-14T10:30:00.000Z',
        lineItems: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            purchaseOrderId: '550e8400-e29b-41d4-a716-446655440000',
            item: 'Office Supplies',
            quantity: '10.00',
            unitPrice: '25.99',
            description: 'High-quality office supplies',
            glAccount: 'Office Expenses',
            amount: '259.90',
            createdAt: '2025-07-14T10:30:00.000Z',
            updatedAt: '2025-07-14T10:30:00.000Z'
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase Order not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Purchase Order with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: 'Not Found'
      }
    }
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a Purchase Order',
    description: 'Updates an existing Purchase Order. Can handle partial updates to header fields and complex line item operations (add, update, delete).'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the Purchase Order to update',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({ type: UpdatePurchaseOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Purchase Order updated successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        vendorName: 'ABC Suppliers Inc. - Updated',
        oneTimeVendor: null,
        poDate: '2025-07-14',
        poNumber: 'PO-2025-001',
        customerSO: 'SO-2025-001',
        customerInvoice: null,
        apAccount: 'Trade Creditors',
        transactionType: 'Goods',
        transactionOrigin: 'Local',
        shipVia: "Customer's Vehicle",
        status: 'SUBMITTED',
        totalAmount: '259.90',
        createdAt: '2025-07-14T10:30:00.000Z',
        updatedAt: '2025-07-14T10:35:00.000Z',
        lineItems: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            purchaseOrderId: '550e8400-e29b-41d4-a716-446655440000',
            item: 'Office Supplies',
            quantity: '10.00',
            unitPrice: '25.99',
            description: 'High-quality office supplies',
            glAccount: 'Office Expenses',
            amount: '259.90',
            createdAt: '2025-07-14T10:30:00.000Z',
            updatedAt: '2025-07-14T10:35:00.000Z'
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: ['Status must be one of: DRAFT, SUBMITTED, APPROVED, REJECTED, COMPLETED, CANCELLED'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase Order not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Purchase Order with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - PO number already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Purchase Order with number PO-2025-002 already exists',
        error: 'Conflict'
      }
    }
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.update(id, updatePurchaseOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete a Purchase Order',
    description: 'Deletes a specific Purchase Order and all its associated line items.'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the Purchase Order to delete',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 204,
    description: 'Purchase Order deleted successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase Order not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Purchase Order with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: 'Not Found'
      }
    }
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrdersService.remove(id);
  }
}