export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchaseOrderStatistics {
  total: number;
  draftCount: number;
  submittedCount: number;
  totalAmount: string;
}

export interface PurchaseOrderResponse extends PaginatedResponse<any> {
  statistics: PurchaseOrderStatistics;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
} 