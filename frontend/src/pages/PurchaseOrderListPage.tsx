import React from 'react';
import { Button, Space, Card, Typography } from 'antd';
import { LoadingSpinner, MessageBox } from '../components/common/index';
import { PurchaseOrderSearchFilter } from '../components/purchase-orders/PurchaseOrderSearchFilter';
import { PurchaseOrderListTable } from '../components/purchase-orders/PurchaseOrderListTable';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { QueryPurchaseOrderDto } from '../types/purchaseOrder';

const { Title } = Typography;

interface PurchaseOrderListPageProps {
  onNavigateToForm?: (id?: string) => void;
}

export const PurchaseOrderListPage: React.FC<PurchaseOrderListPageProps> = ({
  onNavigateToForm
}) => {
  const {
    purchaseOrders,
    loading,
    error,
    pagination,
    filters,
    fetchPurchaseOrders,
    deletePurchaseOrder,
    setFilters,
    clearError,
  } = usePurchaseOrders({
    initialFilters: {
      page: 1,
      limit: 10,
    },
    autoFetch: true,
  });

  const handleFilterChange = (newFilters: Partial<QueryPurchaseOrderDto>) => {
    setFilters(newFilters);
    // fetchPurchaseOrders will be called automatically by the hook when filters change
  };

  const handleNewPurchaseOrder = () => {
    onNavigateToForm?.();
  };

  const handleEditPurchaseOrder = (id: string) => {
    onNavigateToForm?.(id);
  };

  const handleDeletePurchaseOrder = async (id: string) => {
    try {
      await deletePurchaseOrder(id);
    } catch (err) {
      // Error is already handled by the hook
      console.error('Delete failed:', err);
    }
  };

  const handleExportExcel = () => {
    // Placeholder for export functionality
    console.log('Export Excel functionality to be implemented');
  };

  if (error) {
    return (
      <MessageBox
        variant="error"
        message={error}
        closable
        onClose={clearError}
      />
    );
  }

  return (
    <div className="p-6">
      <Card>
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="mb-0">Purchase Orders</Title>
          <Space>
            <Button
              type="primary"
              onClick={handleNewPurchaseOrder}
            >
              New
            </Button>
            <Button
              onClick={handleExportExcel}
            >
              Export Excel
            </Button>
          </Space>
        </div>

        {/* Search & Filter Section */}
        <div className="mb-6">
          <PurchaseOrderSearchFilter
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        </div>

        {/* Table Section */}
        <div className="relative">
          {loading && <LoadingSpinner />}
          <PurchaseOrderListTable
            data={purchaseOrders}
            loading={loading}
            onEdit={handleEditPurchaseOrder}
            onDelete={handleDeletePurchaseOrder}
          />
        </div>
      </Card>
    </div>
  );
}; 