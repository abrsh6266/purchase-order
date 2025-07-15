import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  GLAccount,
  CreateGLAccountDto,
  UpdateGLAccountDto,
  QueryGLAccountDto,
  GLAccountOption,
} from '../types/glAccount';
import { PaginatedResponse } from '../types/api';
import { glAccountService } from '../services/glAccountService';

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  if (error && typeof error === 'object') {
    // Check if it's an API error with message property
    if (error.message && typeof error.message === 'string') {
      return error.message;
    }
    // Check if it's an array of messages
    if (Array.isArray(error.message)) {
      return error.message.join(', ');
    }
    // Check if it's a standard Error object
    if (error instanceof Error) {
      return error.message;
    }
    // Check if it has a statusCode (API error)
    if (error.statusCode && error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred';
};

export interface UseGLAccountsOptions {
  initialFilters?: Partial<QueryGLAccountDto>;
  autoFetch?: boolean;
  pageSize?: number;
}

export interface UseGLAccountsReturn {
  // Data
  glAccounts: GLAccount[];
  currentGLAccount: GLAccount | null;
  accountOptions: GLAccountOption[];

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  // Error state
  error: string | null;

  // Pagination
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Filters
  filters: QueryGLAccountDto;

  // Actions
  fetchGLAccounts: (filters?: Partial<QueryGLAccountDto>) => Promise<void>;
  createGLAccount: (data: CreateGLAccountDto) => Promise<GLAccount>;
  updateGLAccount: (id: string, data: UpdateGLAccountDto) => Promise<GLAccount>;
  deleteGLAccount: (id: string) => Promise<void>;
  getGLAccount: (id: string) => Promise<GLAccount>;

  // Filter actions
  setFilters: (filters: Partial<QueryGLAccountDto>) => void;
  clearFilters: () => void;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Selection
  selectGLAccount: (account: GLAccount | null) => void;

  // Error handling
  clearError: () => void;

  // Table changes
  handleTableChange: (pagination: any, filters: any, sorter: any) => void;

  // Specialized methods
  getAllAccounts: () => Promise<GLAccount[]>;
  getAccountOptions: () => Promise<GLAccountOption[]>;
}

export const useGLAccounts = (
  options: UseGLAccountsOptions = {}
): UseGLAccountsReturn => {
  const { initialFilters = {}, autoFetch = true, pageSize = 10 } = options;

  // State
  const [glAccounts, setGLAccounts] = useState<GLAccount[]>([]);
  const [currentGLAccount, setCurrentGLAccount] = useState<GLAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFiltersState] = useState<QueryGLAccountDto>({
    page: 1,
    limit: pageSize,
    ...initialFilters,
  });

  // Fetch GL accounts
  const fetchGLAccounts = useCallback(
    async (newFilters?: Partial<QueryGLAccountDto>) => {
      setLoading(true);
      setError(null);
      try {
        const queryParams: QueryGLAccountDto = {
          ...filters,
          ...newFilters,
        };

        const response: PaginatedResponse<GLAccount> =
          await glAccountService.findAll(queryParams);

        setGLAccounts(response.data);
        setPagination((prev) => ({
          ...prev,
          current: response.page,
          pageSize: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        }));
      } catch (error) {
        console.error('Error fetching GL accounts:', error);
        const errorMessage =
          extractErrorMessage(error) || 'Failed to fetch GL accounts';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Create GL account
  const createGLAccount = useCallback(
    async (data: CreateGLAccountDto): Promise<GLAccount> => {
      setCreating(true);
      setError(null);
      try {
        const newAccount = await glAccountService.create(data);
        setGLAccounts((prev) => [newAccount, ...prev]);
        return newAccount;
      } catch (error) {
        console.error('Error creating GL account:', error);
        const errorMessage =
          extractErrorMessage(error) || 'Failed to create GL account';
        setError(errorMessage);
        throw error;
      } finally {
        setCreating(false);
      }
    },
    []
  );

  // Update GL account
  const updateGLAccount = useCallback(
    async (id: string, data: UpdateGLAccountDto): Promise<GLAccount> => {
      setUpdating(true);
      setError(null);
      try {
        const updatedAccount = await glAccountService.update(id, data);

        setGLAccounts((prev) =>
          prev.map((account) => (account.id === id ? updatedAccount : account))
        );

        if (currentGLAccount?.id === id) {
          setCurrentGLAccount(updatedAccount);
        }

        return updatedAccount;
      } catch (error) {
        console.error('Error updating GL account:', error);
        const errorMessage =
          extractErrorMessage(error) || 'Failed to update GL account';
        setError(errorMessage);
        throw error;
      } finally {
        setUpdating(false);
      }
    },
    [currentGLAccount]
  );

  // Delete GL account
  const deleteGLAccount = useCallback(
    async (id: string): Promise<void> => {
      setDeleting(true);
      setError(null);
      try {
        await glAccountService.remove(id);

        setGLAccounts((prev) => prev.filter((account) => account.id !== id));

        if (currentGLAccount?.id === id) {
          setCurrentGLAccount(null);
        }
      } catch (error) {
        console.error('Error deleting GL account:', error);
        const errorMessage =
          extractErrorMessage(error) || 'Failed to delete GL account';
        setError(errorMessage);
        throw error;
      } finally {
        setDeleting(false);
      }
    },
    [currentGLAccount]
  );

  // Get single GL account
  const getGLAccount = useCallback(
    async (id: string): Promise<GLAccount> => {
      setError(null);
      try {
        const account = await glAccountService.findOne(id);
        return account;
      } catch (error) {
        console.error('Error fetching GL account:', error);
        const errorMessage =
          extractErrorMessage(error) || 'Failed to fetch GL account';
        setError(errorMessage);
        throw error;
      }
    },
    []
  );

  // Set filters
  const setFilters = useCallback(
    (newFilters: Partial<QueryGLAccountDto>) => {
      setFiltersState((prev) => {
        const updatedFilters = {
          ...prev,
          ...newFilters,
          // Only reset page to 1 if it's not explicitly provided in newFilters
          page: newFilters.page !== undefined ? newFilters.page : 1,
        };
        return updatedFilters;
      });
    },
    []
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({
      page: 1,
      limit: pageSize,
    });
  }, [pageSize]);

  // Set page
  const setPage = useCallback((page: number) => {
    setFiltersState((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  // Set page size
  const setPageSize = useCallback((size: number) => {
    setFiltersState((prev) => ({
      ...prev,
      limit: size,
      page: 1, // Reset to first page when page size changes
    }));
  }, []);

  // Select GL account
  const selectGLAccount = useCallback((account: GLAccount | null) => {
    setCurrentGLAccount(account);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle table changes (sorting, pagination)
  const handleTableChange = useCallback((pagination: any, filters: any, sorter: any) => {
    const newFilters: Partial<QueryGLAccountDto> = {};

    // Handle pagination
    if (pagination) {
      newFilters.page = pagination.current;
      newFilters.limit = pagination.pageSize;
    }

    // Handle sorting
    if (sorter && sorter.field) {
      newFilters.sortBy = sorter.field;
      newFilters.sortOrder = sorter.order === 'descend' ? 'desc' : 'asc';
    }

    setFilters(newFilters);
  }, [setFilters]);

  // Specialized methods
  const getAllAccounts = useCallback(async (): Promise<GLAccount[]> => {
    try {
      return await glAccountService.getAllAccounts();
    } catch (error) {
      console.error('Error fetching all accounts:', error);
      throw error;
    }
  }, []);

  const getAccountOptions = useCallback(async (): Promise<GLAccountOption[]> => {
    try {
      return await glAccountService.getAllAccountOptions();
    } catch (error) {
      console.error('Error fetching account options:', error);
      throw error;
    }
  }, []);

  // Computed values
  const accountOptions = useMemo(() => {
    return glAccountService.convertToOptions(glAccounts);
  }, [glAccounts]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchGLAccounts();
    }
  }, [autoFetch, fetchGLAccounts]);

  // Fetch when filters change (but only if autoFetch is enabled)
  useEffect(() => {
    if (autoFetch) {
      fetchGLAccounts();
    }
  }, [filters, autoFetch, fetchGLAccounts]);

  // Update pagination when filters change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      current: filters.page || 1,
      pageSize: filters.limit || pageSize,
    }));
  }, [filters.page, filters.limit, pageSize]);

  return {
    // Data
    glAccounts,
    currentGLAccount,
    accountOptions,

    // Loading states
    loading,
    creating,
    updating,
    deleting,

    // Error state
    error,

    // Pagination
    pagination: {
      ...pagination,
      hasNext: pagination.current * pagination.pageSize < pagination.total,
      hasPrev: pagination.current > 1,
    },

    // Filters
    filters,

    // Actions
    fetchGLAccounts,
    createGLAccount,
    updateGLAccount,
    deleteGLAccount,
    getGLAccount,

    // Filter actions
    setFilters,
    clearFilters,

    // Pagination actions
    setPage,
    setPageSize,

    // Selection
    selectGLAccount,

    // Error handling
    clearError,

    // Table changes
    handleTableChange,

    // Specialized methods
    getAllAccounts,
    getAccountOptions,
  };
}; 