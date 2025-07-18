import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  QueryPurchaseOrderDto,
} from "../types/purchaseOrder";
import { PurchaseOrderStatus } from "../types/common";
import { PaginatedResponse, PurchaseOrderStatistics } from "../types/api";
import { purchaseOrderService } from "../services/purchaseOrderService";

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  if (error && typeof error === "object") {
    // Handle ApiError type from backend
    if (error.message && typeof error.message === "string") {
      return error.message;
    }
    // Handle array of error messages
    if (Array.isArray(error.message)) {
      return error.message.join(", ");
    }
    // Handle standard Error objects
    if (error instanceof Error) {
      return error.message;
    }
  }
  return "An unexpected error occurred";
};

export interface UsePurchaseOrdersOptions {
  initialFilters?: Partial<QueryPurchaseOrderDto>;
  autoFetch?: boolean;
  pageSize?: number;
}

export interface UsePurchaseOrdersReturn {
  // Data
  purchaseOrders: PurchaseOrder[];
  currentPurchaseOrder: PurchaseOrder | null;

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

  // Filters and search
  filters: QueryPurchaseOrderDto;
  searchTerm: string;

  // Statistics
  statistics: PurchaseOrderStatistics;

  // Actions
  fetchPurchaseOrders: (
    filters?: Partial<QueryPurchaseOrderDto>
  ) => Promise<void>;
  createPurchaseOrder: (data: CreatePurchaseOrderDto) => Promise<PurchaseOrder>;
  updatePurchaseOrder: (
    id: string,
    data: UpdatePurchaseOrderDto
  ) => Promise<PurchaseOrder>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  getPurchaseOrder: (id: string) => Promise<PurchaseOrder>;

  // Filter actions
  setFilters: (filters: Partial<QueryPurchaseOrderDto>) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Selection
  selectPurchaseOrder: (po: PurchaseOrder | null) => void;

  // Error handling
  clearError: () => void;

  // Table changes
  handleTableChange: (pagination: any, filters: any, sorter: any) => void;

  // Computed values
  totalAmount: number;
  statusCounts: Record<PurchaseOrderStatus, number>;
  recentPurchaseOrders: PurchaseOrder[];
}

export const usePurchaseOrders = (
  options: UsePurchaseOrdersOptions = {}
): UsePurchaseOrdersReturn => {
  const { initialFilters = {}, autoFetch = true, pageSize = 10 } = options;

  // State
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [currentPurchaseOrder, setCurrentPurchaseOrder] =
    useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<PurchaseOrderStatistics>({
    total: 0,
    draftCount: 0,
    submittedCount: 0,
    totalAmount: '0',
  });

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFiltersState] = useState<QueryPurchaseOrderDto>({
    page: 1,
    limit: pageSize,
    ...initialFilters,
  });

  const [searchTerm, setSearchTermState] = useState("");

  // Fetch purchase orders
  const fetchPurchaseOrders = useCallback(
    async (newFilters?: Partial<QueryPurchaseOrderDto>) => {
      setLoading(true);
      setError(null);
      try {
        // Get current state values to avoid dependency issues
        const currentFilters = filters;

        const queryParams: QueryPurchaseOrderDto = {
          ...currentFilters,
          ...newFilters,
        };

        console.log('fetchPurchaseOrders - queryParams:', queryParams);

        const response = await purchaseOrderService.findAll(queryParams);

        setPurchaseOrders(response.data);
        setStatistics(response.statistics);
        setPagination((prev) => ({
          ...prev,
          current: response.page,
          pageSize: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        }));
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        const errorMessage =
          extractErrorMessage(error) || "Failed to fetch purchase orders";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Create purchase order
  const createPurchaseOrder = useCallback(
    async (data: CreatePurchaseOrderDto): Promise<PurchaseOrder> => {
      setCreating(true);
      setError(null);
      try {
        const newPO = await purchaseOrderService.create(data);
        setPurchaseOrders((prev) => [newPO, ...prev]);
        return newPO;
      } catch (error) {
        console.error("Error creating purchase order:", error);
        console.log("Error object structure:", {
          type: typeof error,
          isError: error instanceof Error,
          hasMessage: error && typeof error === "object" && "message" in error,
          message: (error as any)?.message,
          fullError: error,
        });
        const errorMessage =
          extractErrorMessage(error) || "Failed to create purchase order";
        setError(errorMessage);
        throw error;
      } finally {
        setCreating(false);
      }
    },
    []
  );

  // Update purchase order
  const updatePurchaseOrder = useCallback(
    async (
      id: string,
      data: UpdatePurchaseOrderDto
    ): Promise<PurchaseOrder> => {
      setUpdating(true);
      setError(null);
      try {
        const updatedPO = await purchaseOrderService.update(id, data);

        setPurchaseOrders((prev) =>
          prev.map((po) => (po.id === id ? updatedPO : po))
        );

        if (currentPurchaseOrder?.id === id) {
          setCurrentPurchaseOrder(updatedPO);
        }

        return updatedPO;
      } catch (error) {
        console.error("Error updating purchase order:", error);
        const errorMessage =
          extractErrorMessage(error) || "Failed to update purchase order";
        setError(errorMessage);
        throw error;
      } finally {
        setUpdating(false);
      }
    },
    [currentPurchaseOrder]
  );

  // Delete purchase order
  const deletePurchaseOrder = useCallback(
    async (id: string): Promise<void> => {
      setDeleting(true);
      setError(null);
      try {
        await purchaseOrderService.remove(id);

        setPurchaseOrders((prev) => prev.filter((po) => po.id !== id));

        if (currentPurchaseOrder?.id === id) {
          setCurrentPurchaseOrder(null);
        }
      } catch (error) {
        console.error("Error deleting purchase order:", error);
        const errorMessage =
          extractErrorMessage(error) || "Failed to delete purchase order";
        setError(errorMessage);
        throw error;
      } finally {
        setDeleting(false);
      }
    },
    [currentPurchaseOrder]
  );

  // Get single purchase order
  const getPurchaseOrder = useCallback(
    async (id: string): Promise<PurchaseOrder> => {
      setError(null);
      try {
        const po = await purchaseOrderService.findOne(id);
        return po;
      } catch (error) {
        console.error("Error fetching purchase order:", error);
        const errorMessage =
          extractErrorMessage(error) || "Failed to fetch purchase order";
        setError(errorMessage);
        throw error;
      }
    },
    []
  );

  // Set filters
  const setFilters = useCallback(
    (newFilters: Partial<QueryPurchaseOrderDto>) => {
      console.log('setFilters called with:', newFilters);
      
      // Update searchTerm state if search is provided
      if (newFilters.search !== undefined) {
        setSearchTermState(newFilters.search);
      }
      
      setFiltersState((prev) => {
        const updatedFilters = {
          ...prev,
          ...newFilters,
          page: 1, // Reset to first page when filters change
        };
        
        console.log('Updated filters:', updatedFilters);
        
        // Trigger fetch with updated filters
        if (autoFetch) {
          setTimeout(() => {
            console.log('Triggering fetchPurchaseOrders with:', updatedFilters);
            fetchPurchaseOrders(updatedFilters);
          }, 0);
        }
        
        return updatedFilters;
      });
    },
    [autoFetch, fetchPurchaseOrders]
  );

  // Set search term
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setFiltersState((prev) => {
      const updatedFilters = {
        ...prev,
        page: 1, // Reset to first page when search changes
      };
      
      // Trigger fetch with updated search term
      if (autoFetch) {
        setTimeout(() => {
          fetchPurchaseOrders({ ...updatedFilters, search: term });
        }, 0);
      }
      
      return updatedFilters;
    });
  }, [autoFetch, fetchPurchaseOrders]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({
      page: 1,
      limit: pageSize,
    });
    setSearchTermState("");
    
    // Trigger fetch with cleared filters
    if (autoFetch) {
      setTimeout(() => {
        fetchPurchaseOrders({ page: 1, limit: pageSize });
      }, 0);
    }
  }, [pageSize, autoFetch, fetchPurchaseOrders]);

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
      pageSize: size,
      page: 1,
    }));
  }, []);

  // Select purchase order
  const selectPurchaseOrder = useCallback((po: PurchaseOrder | null) => {
    setCurrentPurchaseOrder(po);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle table changes (sorting, pagination)
  const handleTableChange = useCallback((pagination: any, filters: any, sorter: any) => {
    const newFilters: Partial<QueryPurchaseOrderDto> = {};
    
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

  // Computed values
  const totalAmount = useMemo(() => {
    return purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  }, [purchaseOrders]);

  const statusCounts = useMemo(() => {
    const counts: Record<PurchaseOrderStatus, number> = {
      DRAFT: 0,
      SUBMITTED: 0,
    };

    purchaseOrders.forEach((po) => {
      counts[po.status]++;
    });

    return counts;
  }, [purchaseOrders]);

  const recentPurchaseOrders = useMemo(() => {
    return purchaseOrders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [purchaseOrders]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPurchaseOrders();
    }
  }, [autoFetch, fetchPurchaseOrders]);

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
    purchaseOrders,
    currentPurchaseOrder,

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

    // Filters and search
    filters,
    searchTerm,

    // Statistics
    statistics,

    // Actions
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrder,

    // Filter actions
    setFilters,
    setSearchTerm,
    clearFilters,

    // Pagination actions
    setPage,
    setPageSize,

    // Selection
    selectPurchaseOrder,

    // Error handling
    clearError,

    // Table changes
    handleTableChange,

    // Computed values
    totalAmount,
    statusCounts,
    recentPurchaseOrders,
  };
};
