import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
import { PurchaseOrder, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PaginatedResponse } from '../common/types/pagination';

@Injectable()
export class PurchaseOrdersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
        try {
            // Check if PO number already exists
            const existingPO = await this.prisma.purchaseOrder.findUnique({
                where: { poNumber: createPurchaseOrderDto.poNumber },
            });

            if (existingPO) {
                throw new ConflictException(`Purchase Order with number ${createPurchaseOrderDto.poNumber} already exists`);
            }

            // Calculate line item amounts and total
            const lineItemsWithAmounts = createPurchaseOrderDto.lineItems.map(item => {
                const amount = this.calculateLineItemAmount(
                    new Decimal(item.quantity),
                    new Decimal(item.unitPrice)
                );
                return {
                    ...item,
                    quantity: new Decimal(item.quantity),
                    unitPrice: new Decimal(item.unitPrice),
                    amount,
                };
            });

            const totalAmount = this.calculateTotalAmount(lineItemsWithAmounts);

            // Create the purchase order with line items
            const purchaseOrder = await this.prisma.purchaseOrder.create({
                data: {
                    vendorName: createPurchaseOrderDto.vendorName,
                    oneTimeVendor: createPurchaseOrderDto.oneTimeVendor,
                    poDate: createPurchaseOrderDto.poDate ? new Date(createPurchaseOrderDto.poDate) : undefined,
                    poNumber: createPurchaseOrderDto.poNumber,
                    customerSO: createPurchaseOrderDto.customerSO,
                    customerInvoice: createPurchaseOrderDto.customerInvoice,
                    apAccount: createPurchaseOrderDto.apAccount,
                    transactionType: createPurchaseOrderDto.transactionType,
                    transactionOrigin: createPurchaseOrderDto.transactionOrigin,
                    shipVia: createPurchaseOrderDto.shipVia,
                    status: createPurchaseOrderDto.status || 'DRAFT', // Default to DRAFT if not provided
                    totalAmount,
                    lineItems: {
                        create: lineItemsWithAmounts,
                    },
                },
                include: {
                    lineItems: true,
                },
            });

            return purchaseOrder;
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            if (error.code === 'P2002' && error.meta?.target?.includes('poNumber')) {
                throw new ConflictException(`Purchase Order with number ${createPurchaseOrderDto.poNumber} already exists`);
            }
            throw new BadRequestException(`Failed to create purchase order: ${error.message}`);
        }
    }

    async findAll(query: QueryPurchaseOrderDto): Promise<PaginatedResponse<PurchaseOrder>> {
        const where: Prisma.PurchaseOrderWhereInput = {};

        // Search functionality
        if (query.search) {
            where.OR = [
                { poNumber: { contains: query.search } },
                { vendorName: { contains: query.search } },
                { customerSO: { contains: query.search } },
            ];
        }

        // Date range filtering
        if (query.startDate || query.endDate) {
            where.poDate = {};
            if (query.startDate) {
                where.poDate.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.poDate.lte = new Date(query.endDate);
            }
        }

        // Status filtering
        if (query.status) {
            where.status = query.status;
        }

        // Pagination
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        // Sorting
        const orderBy: Prisma.PurchaseOrderOrderByWithRelationInput = {};
        const sortBy = query.sortBy || 'createdAt';
        const sortOrder = query.sortOrder || 'desc';
        
        orderBy[sortBy] = sortOrder;

        // Get total count for pagination
        const total = await this.prisma.purchaseOrder.count({ where });

        // Get paginated results
        const purchaseOrders = await this.prisma.purchaseOrder.findMany({
            where,
            include: {
                lineItems: true,
            },
            orderBy,
            skip,
            take: limit,
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data: purchaseOrders,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findOne(id: string): Promise<PurchaseOrder> {
        const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                lineItems: true,
            },
        });

        if (!purchaseOrder) {
            throw new NotFoundException(`Purchase Order with ID ${id} not found`);
        }

        return purchaseOrder;
    }

    async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
        try {
            // Check if purchase order exists
            const existingPO = await this.prisma.purchaseOrder.findUnique({
                where: { id },
                include: { lineItems: true },
            });

            if (!existingPO) {
                throw new NotFoundException(`Purchase Order with ID ${id} not found`);
            }

            // Check for PO number uniqueness if it's being updated
            if (updatePurchaseOrderDto.poNumber && updatePurchaseOrderDto.poNumber !== existingPO.poNumber) {
                const duplicatePO = await this.prisma.purchaseOrder.findUnique({
                    where: { poNumber: updatePurchaseOrderDto.poNumber },
                });

                if (duplicatePO) {
                    throw new ConflictException(`Purchase Order with number ${updatePurchaseOrderDto.poNumber} already exists`);
                }
            }

            // Prepare update data
            const updateData: Prisma.PurchaseOrderUpdateInput = {
                vendorName: updatePurchaseOrderDto.vendorName,
                oneTimeVendor: updatePurchaseOrderDto.oneTimeVendor,
                poDate: updatePurchaseOrderDto.poDate ? new Date(updatePurchaseOrderDto.poDate) : undefined,
                poNumber: updatePurchaseOrderDto.poNumber,
                customerSO: updatePurchaseOrderDto.customerSO,
                customerInvoice: updatePurchaseOrderDto.customerInvoice,
                apAccount: updatePurchaseOrderDto.apAccount,
                transactionType: updatePurchaseOrderDto.transactionType,
                transactionOrigin: updatePurchaseOrderDto.transactionOrigin,
                shipVia: updatePurchaseOrderDto.shipVia,
                status: updatePurchaseOrderDto.status,
            };

            // Remove undefined values
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            // Handle line items updates if provided
            if (updatePurchaseOrderDto.lineItems) {
                await this.handleLineItemsUpdate(id, updatePurchaseOrderDto.lineItems);
            }

            // Recalculate total amount
            const updatedLineItems = await this.prisma.purchaseOrderLineItem.findMany({
                where: { purchaseOrderId: id },
            });

            const totalAmount = this.calculateTotalAmount(updatedLineItems);
            updateData.totalAmount = totalAmount;

            // Update the purchase order
            const updatedPurchaseOrder = await this.prisma.purchaseOrder.update({
                where: { id },
                data: updateData,
                include: {
                    lineItems: true,
                },
            });

            return updatedPurchaseOrder;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            if (error.code === 'P2002' && error.meta?.target?.includes('poNumber')) {
                throw new ConflictException(`Purchase Order with number ${updatePurchaseOrderDto.poNumber} already exists`);
            }
            throw new BadRequestException(`Failed to update purchase order: ${error.message}`);
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
                where: { id },
            });

            if (!purchaseOrder) {
                throw new NotFoundException(`Purchase Order with ID ${id} not found`);
            }

            await this.prisma.purchaseOrder.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`Failed to delete purchase order: ${error.message}`);
        }
    }

    // Private helper methods
    private async handleLineItemsUpdate(purchaseOrderId: string, lineItems: any[]): Promise<void> {
        // First, delete all existing line items for this purchase order
        await this.prisma.purchaseOrderLineItem.deleteMany({
            where: { purchaseOrderId },
        });

        // Then create all the new line items
        if (lineItems.length > 0) {
            const createData = lineItems
                .filter(item => !item._delete) // Filter out items marked for deletion
                .map(item => {
                    const amount = this.calculateLineItemAmount(
                        new Decimal(item.quantity),
                        new Decimal(item.unitPrice)
                    );

                    return {
                        purchaseOrderId,
                        item: item.item,
                        quantity: new Decimal(item.quantity),
                        unitPrice: new Decimal(item.unitPrice),
                        description: item.description,
                        glAccount: item.glAccount,
                        amount,
                    };
                });

            if (createData.length > 0) {
                await this.prisma.purchaseOrderLineItem.createMany({
                    data: createData,
                });
            }
        }
    }

    private calculateLineItemAmount(quantity: Decimal, unitPrice: Decimal): Decimal {
        return quantity.mul(unitPrice);
    }

    private calculateTotalAmount(lineItems: Array<{ amount: Decimal }>): Decimal {
        return lineItems.reduce((total, item) => total.add(item.amount), new Decimal(0));
    }
}