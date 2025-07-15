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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { GLAccountsService } from './gl-accounts.service';
import { CreateGLAccountDto } from './dto/create-gl-account.dto';
import { UpdateGLAccountDto } from './dto/update-gl-account.dto';
import { QueryGLAccountDto } from './dto/query-gl-account.dto';
import { PaginatedResponse } from '../common/types/pagination';

@ApiTags('GL Accounts')
@Controller('gl-accounts')
export class GLAccountsController {
  constructor(private readonly glAccountsService: GLAccountsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new GL Account',
    description: 'Creates a new General Ledger account with validation for unique account codes.',
  })
  @ApiResponse({
    status: 201,
    description: 'GL Account created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        accountCode: '1000',
        accountName: 'Cash',
        description: 'Cash and cash equivalents',
        createdAt: '2025-07-15T10:30:00.000Z',
        updatedAt: '2025-07-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - account code already exists',
  })
  create(@Body() createGLAccountDto: CreateGLAccountDto): Promise<any> {
    return this.glAccountsService.create(createGLAccountDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all GL Accounts',
    description: 'Retrieves a paginated list of GL Accounts with optional filtering, searching, and sorting capabilities.',
  })
  @ApiQuery({ type: QueryGLAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of GL Accounts retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            accountCode: '1000',
            accountName: 'Cash',
            description: 'Cash and cash equivalents',
            createdAt: '2025-07-15T10:30:00.000Z',
            updatedAt: '2025-07-15T10:30:00.000Z',
            _count: {
              lineItems: 0,
            },
          },
        ],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      },
    },
  })
  findAll(@Query() query: QueryGLAccountDto): Promise<PaginatedResponse<any>> {
    return this.glAccountsService.findAll(query);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all GL Accounts for dropdowns',
    description: 'Retrieves all GL Accounts for use in forms and dropdowns.',
  })
  @ApiResponse({
    status: 200,
    description: 'All GL Accounts retrieved successfully',
  })
  getAllAccounts(): Promise<any[]> {
    return this.glAccountsService.getAllAccounts();
  }

  @Get('code/:accountCode')
  @ApiOperation({
    summary: 'Get GL Account by code',
    description: 'Retrieves a specific GL Account by its account code.',
  })
  @ApiParam({
    name: 'accountCode',
    description: 'Account code to search for',
    example: '1000',
  })
  @ApiResponse({
    status: 200,
    description: 'GL Account retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'GL Account not found',
  })
  findByCode(@Param('accountCode') accountCode: string): Promise<any> {
    return this.glAccountsService.findByCode(accountCode);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get GL Account by ID',
    description: 'Retrieves a specific GL Account by its ID with full details.',
  })
  @ApiParam({
    name: 'id',
    description: 'GL Account ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'GL Account retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'GL Account not found',
  })
  findOne(@Param('id') id: string): Promise<any> {
    return this.glAccountsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update GL Account',
    description: 'Updates an existing GL Account with validation for unique account codes.',
  })
  @ApiParam({
    name: 'id',
    description: 'GL Account ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'GL Account updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'GL Account not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - account code already exists',
  })
  update(@Param('id') id: string, @Body() updateGLAccountDto: UpdateGLAccountDto): Promise<any> {
    return this.glAccountsService.update(id, updateGLAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete GL Account',
    description: 'Deletes a GL Account if it is not being used in any line items.',
  })
  @ApiParam({
    name: 'id',
    description: 'GL Account ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'GL Account deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'GL Account not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - account is being used in line items',
  })
  remove(@Param('id') id: string) {
    return this.glAccountsService.remove(id);
  }
} 