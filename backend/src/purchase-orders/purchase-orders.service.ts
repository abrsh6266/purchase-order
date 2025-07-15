import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
import { PurchaseOrder, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

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

    async findAll(query: QueryPurchaseOrderDto): Promise<PurchaseOrder[]> {
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

        const purchaseOrders = await this.prisma.purchaseOrder.findMany({
            where,
            include: {
                lineItems: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return purchaseOrders;
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
        const lineItemsToDelete = lineItems.filter(item => item._delete && item.id);
        const lineItemsToUpdate = lineItems.filter(item => !item._delete && item.id);
        const lineItemsToCreate = lineItems.filter(item => !item._delete && !item.id);

        // Delete line items
        if (lineItemsToDelete.length > 0) {
            await this.prisma.purchaseOrderLineItem.deleteMany({
                where: {
                    id: { in: lineItemsToDelete.map(item => item.id) },
                    purchaseOrderId,
                },
            });
        }

        // Update existing line items
        for (const item of lineItemsToUpdate) {
            const updateData: any = {
                item: item.item,
                quantity: item.quantity ? new Decimal(item.quantity) : undefined,
                unitPrice: item.unitPrice ? new Decimal(item.unitPrice) : undefined,
                description: item.description,
                glAccount: item.glAccount,
            };

            // Remove undefined values
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            // Calculate amount if quantity or unitPrice changed
            if (updateData.quantity !== undefined || updateData.unitPrice !== undefined) {
                const existingItem = await this.prisma.purchaseOrderLineItem.findUnique({
                    where: { id: item.id },
                });

                const quantity = updateData.quantity || existingItem.quantity;
                const unitPrice = updateData.unitPrice || existingItem.unitPrice;
                updateData.amount = this.calculateLineItemAmount(quantity, unitPrice);
            }

            await this.prisma.purchaseOrderLineItem.update({
                where: { id: item.id },
                data: updateData,
            });
        }

        // Create new line items
        if (lineItemsToCreate.length > 0) {
            const createData = lineItemsToCreate.map(item => {
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

            await this.prisma.purchaseOrderLineItem.createMany({
                data: createData,
            });
        }
    }

    private calculateLineItemAmount(quantity: Decimal, unitPrice: Decimal): Decimal {
        return quantity.mul(unitPrice);
    }

    private calculateTotalAmount(lineItems: Array<{ amount: Decimal }>): Decimal {
        return lineItems.reduce((total, item) => total.add(item.amount), new Decimal(0));
    }
}