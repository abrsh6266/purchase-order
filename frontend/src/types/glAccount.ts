export interface GLAccount {
  id: string;
  accountCode: string;
  accountName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    lineItems: number;
  };
}

export interface CreateGLAccountDto {
  accountCode: string;
  accountName: string;
  description?: string;
}

export interface UpdateGLAccountDto {
  accountCode?: string;
  accountName?: string;
  description?: string;
}

export interface QueryGLAccountDto {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'accountCode' | 'accountName' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GLAccountOption {
  label: string;
  value: string;
  accountCode: string;
  accountName: string;
} 