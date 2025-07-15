import React, { useState, useEffect, useRef } from 'react';
import { Input, DatePicker, Select, Space, Card, Button } from 'antd';
import { QueryPurchaseOrderDto } from '../../types/purchaseOrder';
import { PurchaseOrderStatus } from '../../types/common';
import { useDebounce } from '../../hooks/useDebounce';

const { RangePicker } = DatePicker;

interface PurchaseOrderSearchFilterProps {
  onFilterChange: (filters: Partial<QueryPurchaseOrderDto>) => void;
  filters: QueryPurchaseOrderDto;
  onClearFilters?: () => void;
}

export const PurchaseOrderSearchFilter: React.FC<PurchaseOrderSearchFilterProps> = ({
  onFilterChange,
  filters,
  onClearFilters
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [dateRange, setDateRange] = useState<[string, string] | null>(
    filters.startDate && filters.endDate ? [filters.startDate, filters.endDate] : null
  );
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | undefined>(
    filters.status
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const prevFiltersRef = useRef({ debouncedSearchTerm, dateRange, statusFilter });

  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const currentFilters = { debouncedSearchTerm, dateRange, statusFilter };
    
    // Check if any filter actually changed
    const hasChanged = 
      prevFilters.debouncedSearchTerm !== debouncedSearchTerm ||
      JSON.stringify(prevFilters.dateRange) !== JSON.stringify(dateRange) ||
      prevFilters.statusFilter !== statusFilter;

    if (hasChanged) {
      console.log('Filter changed:', { debouncedSearchTerm, dateRange, statusFilter });
      const newFilters: Partial<QueryPurchaseOrderDto> = {};
      
      if (debouncedSearchTerm) {
        newFilters.search = debouncedSearchTerm;
      }
      
      if (dateRange) {
        newFilters.startDate = dateRange[0];
        newFilters.endDate = dateRange[1];
      }
      
      if (statusFilter) {
        newFilters.status = statusFilter;
      }

      console.log('Calling onFilterChange with:', newFilters);
      onFilterChange(newFilters);
      prevFiltersRef.current = currentFilters;
    }
  }, [debouncedSearchTerm, dateRange, statusFilter, onFilterChange]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleDateRangeChange = (_dates: any, dateStrings: [string, string]) => {
    setDateRange(dateStrings[0] && dateStrings[1] ? dateStrings : null);
  };

  const handleStatusChange = (value: PurchaseOrderStatus | undefined) => {
    setStatusFilter(value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateRange(null);
    setStatusFilter(undefined);
    onClearFilters?.();
  };

  const statusOptions = Object.entries(PurchaseOrderStatus).map(([_key, value]) => ({
    label: value,
    value: value
  }));

  return (
    <Card size="small">
      <Space wrap className="w-full" align="center">
        <Input.Search
          placeholder="Search PO Number, Vendor, or Customer SO..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        
        <RangePicker
          placeholder={['Start Date', 'End Date']}
          onChange={handleDateRangeChange}
          style={{ width: 250 }}
        />
        
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={handleStatusChange}
          allowClear
          style={{ width: 150 }}
          options={statusOptions}
        />

        <Button 
          onClick={handleClearFilters}
          type="default"
        >
          Clear Filters
        </Button>
      </Space>
    </Card>
  );
}; 