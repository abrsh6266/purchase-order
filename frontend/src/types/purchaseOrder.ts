import {
  PurchaseOrderStatus,
  TransactionOrigin,
  TransactionType,
  ShipVia,
} from './common';

export interface PurchaseOrderLineItem {
  id: string;
  purchaseOrderId: string;
  item: string;
  quantity: number;
  unitPrice: number;
  description: string | null;
  glAccountId: string;
  glAccount?: {
    id: string;
    accountCode: string;
    accountName: string;
    accountType: string;
  };
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  vendorName: string;
  oneTimeVendor: string | null;
  poDate: string;
  poNumber: string;
  customerSO: string | null;
  customerInvoice: string | null;
  apAccount: string;
  transactionType: TransactionType;
  transactionOrigin: TransactionOrigin | null;
  shipVia: ShipVia | null;
  status: PurchaseOrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  lineItems: PurchaseOrderLineItem[];
}

export interface CreatePurchaseOrderLineItemDto {
  item: string;
  quantity: number;
  unitPrice: number;
  description?: string;
  glAccountId: string;
}

export interface CreatePurchaseOrderDto {
  vendorName: string;
  oneTimeVendor?: string;
  poDate?: string;
  poNumber: string;
  customerSO?: string;
  customerInvoice?: string;
  apAccount: string;
  transactionType: TransactionType;
  transactionOrigin?: TransactionOrigin;
  shipVia?: ShipVia;
  status?: PurchaseOrderStatus;
  lineItems: CreatePurchaseOrderLineItemDto[];
}

export interface UpdatePurchaseOrderLineItemDto {
  id?: string; // Include ID for existing items
  item?: string;
  quantity?: number;
  unitPrice?: number;
  description?: string;
  glAccountId?: string;
}

export interface UpdatePurchaseOrderDto {
  vendorName?: string;
  oneTimeVendor?: string;
  poDate?: string;
  poNumber?: string;
  customerSO?: string;
  customerInvoice?: string;
  apAccount?: string;
  transactionType?: TransactionType;
  transactionOrigin?: TransactionOrigin;
  shipVia?: ShipVia;
  status?: PurchaseOrderStatus;
  lineItems?: {
    create?: CreatePurchaseOrderLineItemDto[];
    update?: UpdatePurchaseOrderLineItemDto[];
    delete?: string[];
  };
}

export interface QueryPurchaseOrderDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: PurchaseOrderStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'poDate' | 'poNumber' | 'vendorName' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
} 