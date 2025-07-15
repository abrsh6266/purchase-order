import React, { useState, useEffect } from 'react';
import { Input, DatePicker, Select, Space, Card } from 'antd';
import { QueryPurchaseOrderDto } from '../../types/purchaseOrder';
import { PurchaseOrderStatus } from '../../types/common';
import { useDebounce } from '../../hooks/useDebounce';

const { RangePicker } = DatePicker;

interface PurchaseOrderSearchFilterProps {
  onFilterChange: (filters: Partial<QueryPurchaseOrderDto>) => void;
  filters: QueryPurchaseOrderDto;
}

export const PurchaseOrderSearchFilter: React.FC<PurchaseOrderSearchFilterProps> = ({
  onFilterChange,
  filters
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [dateRange, setDateRange] = useState<[string, string] | null>(
    filters.startDate && filters.endDate ? [filters.startDate, filters.endDate] : null
  );
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | undefined>(
    filters.status
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
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

    onFilterChange(newFilters);
  }, [debouncedSearchTerm, dateRange, statusFilter]); // Remove onFilterChange from dependencies

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setDateRange(dateStrings[0] && dateStrings[1] ? dateStrings : null);
  };

  const handleStatusChange = (value: PurchaseOrderStatus | undefined) => {
    setStatusFilter(value);
  };

  const statusOptions = Object.entries(PurchaseOrderStatus).map(([key, value]) => ({
    label: value,
    value: value
  }));

  return (
    <Card size="small">
      <Space wrap className="w-full">
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
      </Space>
    </Card>
  );
}; 