import React, { useState } from "react";
import { Button, Space, Typography } from "antd";
import { LoadingSpinner, MessageBox } from "../components/common/index";
import { PurchaseOrderSearchFilter } from "../components/purchase-orders/PurchaseOrderSearchFilter";
import { PurchaseOrderListTable } from "../components/purchase-orders/PurchaseOrderListTable";
import { GLAccountModal } from "../components/gl-accounts/GLAccountModal";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { QueryPurchaseOrderDto } from "../types/purchaseOrder";
import { GLAccount } from "../types/glAccount";
import { useNavigate } from "react-router-dom";
import { BankOutlined } from "@ant-design/icons";

const { Title } = Typography;

export const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [showGLAccountModal, setShowGLAccountModal] = useState(false);

  const {
    purchaseOrders,
    loading,
    error,
    pagination,
    filters,
    deletePurchaseOrder,
    setFilters,
    clearError,
    handleTableChange,
    clearFilters,
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
    navigate("/purchase-orders/new");
  };

  const handleEditPurchaseOrder = (id: string) => {
    navigate(`/purchase-orders/${id}`);
  };

  const handleDeletePurchaseOrder = async (id: string) => {
    try {
      await deletePurchaseOrder(id);
    } catch (err) {
      // Error is already handled by the hook
      console.error("Delete failed:", err);
    }
  };

  const handleExportExcel = () => {
    // Placeholder for export functionality
    console.log("Export Excel functionality to be implemented");
  };

  const handleManageGLAccounts = () => {
    setShowGLAccountModal(true);
  };

  const handleGLAccountModalClose = () => {
    setShowGLAccountModal(false);
  };

  const handleGLAccountCreated = (account: GLAccount) => {
    // Optionally show a success message or refresh related data
    console.log("GL Account created:", account);
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
    <div style={{ padding: "24px" }}>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button type="primary" onClick={handleNewPurchaseOrder}>
            New Purchase Order
          </Button>
          <Button onClick={handleExportExcel}>Export Excel</Button>
        </Space>
      </div>

      {/* Search & Filter Section */}
      <div className="mb-6">
        <PurchaseOrderSearchFilter
          onFilterChange={handleFilterChange}
          filters={filters}
          onClearFilters={clearFilters}
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
          pagination={pagination}
          onTableChange={handleTableChange}
        />
      </div>
    </div>
  );
};
