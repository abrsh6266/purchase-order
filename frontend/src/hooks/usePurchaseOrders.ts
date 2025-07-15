import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { PurchaseOrder, CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrderDto } from '../types/purchaseOrder';
import { PurchaseOrderStatus } from '../types/common';
import { PaginatedResponse, ApiError } from '../types/api';
import { purchaseOrderService } from '../services/purchaseOrderService';
import { formatDate } from '../utils/dateUtils';
import { calculateTotal } from '../utils/numberUtils';

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
  
  // Actions
  fetchPurchaseOrders: (filters?: Partial<QueryPurchaseOrderDto>) => Promise<void>;
  createPurchaseOrder: (data: CreatePurchaseOrderDto) => Promise<PurchaseOrder>;
  updatePurchaseOrder: (id: string, data: UpdatePurchaseOrderDto) => Promise<PurchaseOrder>;
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
  
  // Computed values
  totalAmount: number;
  statusCounts: Record<PurchaseOrderStatus, number>;
  recentPurchaseOrders: PurchaseOrder[];
}

export const usePurchaseOrders = (options: UsePurchaseOrdersOptions = {}): UsePurchaseOrdersReturn => {
  const {
    initialFilters = {},
    autoFetch = true,
    pageSize = 10,
  } = options;

  // State
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState<PurchaseOrder | null>(null);
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
  const [filters, setFiltersState] = useState<QueryPurchaseOrderDto>({
    page: 1,
    limit: pageSize,
    ...initialFilters,
  });
  
  const [searchTerm, setSearchTermState] = useState('');

  // Fetch purchase orders
  const fetchPurchaseOrders = useCallback(async (newFilters?: Partial<QueryPurchaseOrderDto>) => {
    setLoading(true);
    setError(null);
    try {
      // Get current state values to avoid dependency issues
      const currentFilters = filters;
      const currentSearchTerm = searchTerm;
      
      const queryParams: QueryPurchaseOrderDto = {
        ...currentFilters,
        ...newFilters,
        search: currentSearchTerm,
      };
      
      const response: PaginatedResponse<PurchaseOrder> = await purchaseOrderService.findAll(queryParams);
      
      setPurchaseOrders(response.data);
      setPagination(prev => ({
        ...prev,
        current: response.page,
        pageSize: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch purchase orders';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies to prevent infinite loop

  // Create purchase order
  const createPurchaseOrder = useCallback(async (data: CreatePurchaseOrderDto): Promise<PurchaseOrder> => {
    setCreating(true);
    setError(null);
    try {
      const newPO = await purchaseOrderService.create(data);
      setPurchaseOrders(prev => [newPO, ...prev]);
      return newPO;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create purchase order';
      setError(errorMessage);
      throw error;
    } finally {
      setCreating(false);
    }
  }, []);

  // Update purchase order
  const updatePurchaseOrder = useCallback(async (id: string, data: UpdatePurchaseOrderDto): Promise<PurchaseOrder> => {
    setUpdating(true);
    setError(null);
    try {
      const updatedPO = await purchaseOrderService.update(id, data);
      
      setPurchaseOrders(prev => 
        prev.map(po => po.id === id ? updatedPO : po)
      );
      
      if (currentPurchaseOrder?.id === id) {
        setCurrentPurchaseOrder(updatedPO);
      }
      
      return updatedPO;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update purchase order';
      setError(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [currentPurchaseOrder]);

  // Delete purchase order
  const deletePurchaseOrder = useCallback(async (id: string): Promise<void> => {
    setDeleting(true);
    setError(null);
    try {
      await purchaseOrderService.remove(id);
      
      setPurchaseOrders(prev => prev.filter(po => po.id !== id));
      
      if (currentPurchaseOrder?.id === id) {
        setCurrentPurchaseOrder(null);
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete purchase order';
      setError(errorMessage);
      throw error;
    } finally {
      setDeleting(false);
    }
  }, [currentPurchaseOrder]);

  // Get single purchase order
  const getPurchaseOrder = useCallback(async (id: string): Promise<PurchaseOrder> => {
    setError(null);
    try {
      const po = await purchaseOrderService.findOne(id);
      return po;
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch purchase order';
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<QueryPurchaseOrderDto>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  // Set search term
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setFiltersState(prev => ({
      ...prev,
      page: 1, // Reset to first page when search changes
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({
      page: 1,
      limit: pageSize,
    });
    setSearchTermState('');
  }, [pageSize]);

  // Set page
  const setPage = useCallback((page: number) => {
    setFiltersState(prev => ({
      ...prev,
      page,
    }));
  }, []);

  // Set page size
  const setPageSize = useCallback((size: number) => {
    setFiltersState(prev => ({
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

  // Computed values
  const totalAmount = useMemo(() => {
    return purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  }, [purchaseOrders]);

  const statusCounts = useMemo(() => {
    const counts: Record<PurchaseOrderStatus, number> = {
      DRAFT: 0,
      SUBMITTED: 0,
      APPROVED: 0,
      REJECTED: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    
    purchaseOrders.forEach(po => {
      counts[po.status]++;
    });
    
    return counts;
  }, [purchaseOrders]);

  const recentPurchaseOrders = useMemo(() => {
    return purchaseOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [purchaseOrders]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPurchaseOrders();
    }
  }, [autoFetch]); // Remove fetchPurchaseOrders dependency

  // Fetch when filters or search term change (but not on initial mount)
  const isInitialMount = useRef(true);
  const prevFiltersRef = useRef(filters);
  const prevSearchTermRef = useRef(searchTerm);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevFiltersRef.current = filters;
      prevSearchTermRef.current = searchTerm;
      return;
    }
    
    // Only fetch if filters or search term actually changed
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    const searchTermChanged = prevSearchTermRef.current !== searchTerm;
    
    if ((filtersChanged || searchTermChanged) && autoFetch) {
      fetchPurchaseOrders();
      prevFiltersRef.current = filters;
      prevSearchTermRef.current = searchTerm;
    }
  }, [filters, searchTerm, autoFetch]); // This will trigger when filters/search change

  // Update pagination when filters change
  useEffect(() => {
    setPagination(prev => ({
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
    
    // Computed values
    totalAmount,
    statusCounts,
    recentPurchaseOrders,
  };
}; 