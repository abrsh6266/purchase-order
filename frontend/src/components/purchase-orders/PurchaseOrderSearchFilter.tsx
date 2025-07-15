import React, { useState, useEffect, useRef } from "react";
import {
  Input,
  DatePicker,
  Select,
  Space,
  Button,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  CalendarOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { QueryPurchaseOrderDto } from "../../types/purchaseOrder";
import { PurchaseOrderStatus } from "../../types/common";
import { useDebounce } from "../../hooks/useDebounce";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface PurchaseOrderSearchFilterProps {
  onFilterChange: (filters: Partial<QueryPurchaseOrderDto>) => void;
  filters: QueryPurchaseOrderDto;
  onClearFilters?: () => void;
}

export const PurchaseOrderSearchFilter: React.FC<
  PurchaseOrderSearchFilterProps
> = ({ onFilterChange, filters, onClearFilters }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [dateRange, setDateRange] = useState<[string, string] | null>(
    filters.startDate && filters.endDate
      ? [filters.startDate, filters.endDate]
      : null
  );
  const [statusFilter, setStatusFilter] = useState<
    PurchaseOrderStatus | undefined
  >(filters.status);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const prevFiltersRef = useRef({
    debouncedSearchTerm,
    dateRange,
    statusFilter,
  });

  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const currentFilters = { debouncedSearchTerm, dateRange, statusFilter };

    // Check if any filter actually changed
    const hasChanged =
      prevFilters.debouncedSearchTerm !== debouncedSearchTerm ||
      JSON.stringify(prevFilters.dateRange) !== JSON.stringify(dateRange) ||
      prevFilters.statusFilter !== statusFilter;

    if (hasChanged) {
      console.log("Filter changed:", {
        debouncedSearchTerm,
        dateRange,
        statusFilter,
      });
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

      console.log("Calling onFilterChange with:", newFilters);
      onFilterChange(newFilters);
      prevFiltersRef.current = currentFilters;
    }
  }, [debouncedSearchTerm, dateRange, statusFilter, onFilterChange]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleDateRangeChange = (
    _dates: any,
    dateStrings: [string, string]
  ) => {
    setDateRange(dateStrings[0] && dateStrings[1] ? dateStrings : null);
  };

  const handleStatusChange = (value: PurchaseOrderStatus | undefined) => {
    setStatusFilter(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateRange(null);
    setStatusFilter(undefined);
    onClearFilters?.();
  };

  const statusOptions = Object.entries(PurchaseOrderStatus).map(
    ([_key, value]) => ({
      label: value,
      value: value,
    })
  );

  const hasActiveFilters = searchTerm || dateRange || statusFilter;

  return (
    <div className="purchase-order-search-filter">
      <Row gutter={[16, 16]} align="middle">
        {/* Search Input */}
        <Col xs={24} md={8}>
          <div>
            <Text strong className="block mb-2 flex items-center gap-1">
              <SearchOutlined className="text-blue-500" />
              Search
            </Text>
            <Input.Search
              placeholder="Search PO Number, Vendor, or Customer SO..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              allowClear
              size="large"
              className="w-full"
            />
          </div>
        </Col>

        {/* Date Range */}
        <Col xs={24} md={8}>
          <div>
            <Text strong className="block mb-2 flex items-center gap-1">
              <CalendarOutlined className="text-green-500" />
              Date Range
            </Text>
            <RangePicker
              placeholder={["Start Date", "End Date"]}
              onChange={handleDateRangeChange}
              size="large"
              className="w-full"
              format="YYYY-MM-DD"
            />
          </div>
        </Col>

        {/* Status Filter */}
        <Col xs={24} md={6}>
          <div>
            <Text strong className="block mb-2 flex items-center gap-1">
              <TagOutlined className="text-purple-500" />
              Status
            </Text>
            <Select
              placeholder="All Statuses"
              value={statusFilter}
              onChange={handleStatusChange}
              allowClear
              size="large"
              className="w-full"
              options={statusOptions}
            />
          </div>
        </Col>

        {/* Actions */}
      </Row>
      <div className="flex justify-start mt-2">
        <div className="flex flex-row gap-2">
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={() => onFilterChange({})}
            className="w-24"
            disabled={!hasActiveFilters}
          >
            Apply
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={handleClearFilters}
            className="w-24"
            disabled={!hasActiveFilters}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4">
          <Divider orientation="left">
            <Text type="secondary" className="flex items-center gap-1">
              <FilterOutlined />
              Active Filters
            </Text>
          </Divider>
          <Space wrap>
            {searchTerm && (
              <Button size="small" type="default">
                Search: "{searchTerm}"
              </Button>
            )}
            {dateRange && (
              <Button size="small" type="default">
                Date: {dateRange[0]} to {dateRange[1]}
              </Button>
            )}
            {statusFilter && (
              <Button size="small" type="default">
                Status: {statusFilter}
              </Button>
            )}
          </Space>
        </div>
      )}
    </div>
  );
};
