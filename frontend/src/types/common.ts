export const PurchaseOrderStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type PurchaseOrderStatus = (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus];

export const TransactionType = {
  GOODS: 'Goods',
  SERVICES: 'Services',
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionOrigin = {
  LOCAL: 'Local',
  IMPORTED: 'Imported',
} as const;

export type TransactionOrigin = (typeof TransactionOrigin)[keyof typeof TransactionOrigin];

export const ShipVia = {
  CUSTOMER_VEHICLE: "Customer's Vehicle",
  COMPANY_VEHICLE: 'Company Vehicle',
  COURIER: 'Courier',
  MAIL: 'Mail',
} as const;

export type ShipVia = (typeof ShipVia)[keyof typeof ShipVia]; 