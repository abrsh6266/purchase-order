import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGLAccountDto } from './dto/create-gl-account.dto';
import { UpdateGLAccountDto } from './dto/update-gl-account.dto';
import { QueryGLAccountDto } from './dto/query-gl-account.dto';
import { PaginatedResponse } from '../common/types/pagination';

// Define GLAccount type until Prisma client is generated
interface GLAccount {
  id: string;
  accountCode: string;
  accountName: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    lineItems: number;
  };
}

@Injectable()
export class GLAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGLAccountDto: CreateGLAccountDto): Promise<GLAccount> {
    // Check if account code already exists
    const existingAccount = await this.prisma.gLAccount.findUnique({
      where: { accountCode: createGLAccountDto.accountCode },
    });

    if (existingAccount) {
      throw new ConflictException(`Account with code ${createGLAccountDto.accountCode} already exists`);
    }

    return this.prisma.gLAccount.create({
      data: createGLAccountDto,
    });
  }

  async findAll(query: QueryGLAccountDto): Promise<PaginatedResponse<GLAccount>> {
    const where: any = {};

    // Search functionality
    if (query.search) {
      where.OR = [
        { accountCode: { contains: query.search } },
        { accountName: { contains: query.search } },
      ];
    }

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const orderBy: any = {};
    const sortBy = query.sortBy || 'accountCode';
    const sortOrder = query.sortOrder || 'asc';
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const total = await this.prisma.gLAccount.count({ where });

    // Get paginated results
    const glAccounts = await this.prisma.gLAccount.findMany({
      where,
      include: {
        _count: {
          select: {
            lineItems: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: glAccounts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<GLAccount> {
    const glAccount = await this.prisma.gLAccount.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            lineItems: true,
          },
        },
      },
    });

    if (!glAccount) {
      throw new NotFoundException(`GL Account with ID ${id} not found`);
    }

    return glAccount;
  }

  async findByCode(accountCode: string): Promise<GLAccount> {
    const glAccount = await this.prisma.gLAccount.findUnique({
      where: { accountCode },
    });

    if (!glAccount) {
      throw new NotFoundException(`GL Account with code ${accountCode} not found`);
    }

    return glAccount;
  }

  async update(id: string, updateGLAccountDto: UpdateGLAccountDto): Promise<GLAccount> {
    // Check if account exists
    const existingAccount = await this.prisma.gLAccount.findUnique({
      where: { id },
    });

    if (!existingAccount) {
      throw new NotFoundException(`GL Account with ID ${id} not found`);
    }

    // If account code is being updated, check for uniqueness
    if (updateGLAccountDto.accountCode && updateGLAccountDto.accountCode !== existingAccount.accountCode) {
      const duplicateAccount = await this.prisma.gLAccount.findUnique({
        where: { accountCode: updateGLAccountDto.accountCode },
      });

      if (duplicateAccount) {
        throw new ConflictException(`Account with code ${updateGLAccountDto.accountCode} already exists`);
      }
    }

    return this.prisma.gLAccount.update({
      where: { id },
      data: updateGLAccountDto,
      include: {
        _count: {
          select: {
            lineItems: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    // Check if account exists
    const existingAccount = await this.prisma.gLAccount.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            lineItems: true,
          },
        },
      },
    });

    if (!existingAccount) {
      throw new NotFoundException(`GL Account with ID ${id} not found`);
    }

    // Check if account is being used in line items
    if (existingAccount._count.lineItems > 0) {
      throw new ConflictException(
        `Cannot delete GL Account. It is being used in ${existingAccount._count.lineItems} line item(s)`
      );
    }

    await this.prisma.gLAccount.delete({
      where: { id },
    });
  }

  async getAllAccounts(): Promise<Partial<GLAccount>[]> {
    return this.prisma.gLAccount.findMany({
      select: {
        id: true,
        accountCode: true,
        accountName: true,
        description: true,
      },
      orderBy: {
        accountCode: 'asc',
      },
    });
  }
} 