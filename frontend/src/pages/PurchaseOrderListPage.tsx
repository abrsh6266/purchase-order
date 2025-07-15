import React, { useState } from "react";
import { Button, Space, Card, Row, Col, Statistic, Badge } from "antd";
import {
  PlusOutlined,
  FileExcelOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { LoadingSpinner, MessageBox } from "../components/common/index";
import { PurchaseOrderSearchFilter } from "../components/purchase-orders/PurchaseOrderSearchFilter";
import { PurchaseOrderListTable } from "../components/purchase-orders/PurchaseOrderListTable";
import { GLAccountModal } from "../components/gl-accounts/GLAccountModal";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { QueryPurchaseOrderDto } from "../types/purchaseOrder";
import { GLAccount } from "../types/glAccount";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/numberUtils";

export const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [showGLAccountModal, setShowGLAccountModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const {
    purchaseOrders,
    loading,
    error,
    pagination,
    filters,
    statistics,
    deletePurchaseOrder,
    setFilters,
    clearError,
    handleTableChange,
    clearFilters,
    fetchPurchaseOrders,
  } = usePurchaseOrders({
    initialFilters: {
      page: 1,
      limit: 10,
    },
    autoFetch: true,
  });

  const handleFilterChange = (newFilters: Partial<QueryPurchaseOrderDto>) => {
    setFilters(newFilters);
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
      console.error("Delete failed:", err);
    }
  };

  const handleExportExcel = () => {
    console.log("Export Excel functionality to be implemented");
  };

  const handleManageGLAccounts = () => {
    setShowGLAccountModal(true);
  };

  const handleGLAccountModalClose = () => {
    setShowGLAccountModal(false);
  };

  const handleGLAccountCreated = (account: GLAccount) => {
    console.log("GL Account created:", account);
  };

  const handleRefresh = () => {
    fetchPurchaseOrders();
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
    <div className="purchase-order-list-page">
      <div className="mb-6">
        <div className="flex justify-end items-center mb-4">
          <Space size="middle">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewPurchaseOrder}
              size="large"
            >
              New Purchase Order
            </Button>
          </Space>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="statistic-card">
              <Statistic
                title="Total Orders"
                value={statistics.total}
                prefix={<ShoppingCartOutlined className="text-blue-500" />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="statistic-card">
              <Statistic
                title="Draft Orders"
                value={statistics.draftCount}
                prefix={<ClockCircleOutlined className="text-orange-500" />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="statistic-card">
              <Statistic
                title="Submitted Orders"
                value={statistics.submittedCount}
                prefix={<Badge status="processing" />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="statistic-card">
              <Statistic
                title="Total Value"
                value={formatCurrency(parseFloat(statistics.totalAmount))}
                prefix={<DollarOutlined className="text-green-500" />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Search & Filter Section */}
      <Card
        className="mb-6 filter-section"
        size="small"
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SearchOutlined className="text-blue-500" />
              <span>Search & Filters</span>
            </div>
            <Space>
              <Button
                type="text"
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
              >
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                size="small"
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </div>
        }
      >
        {showFilters && (
          <div className="mt-4">
            <PurchaseOrderSearchFilter
              onFilterChange={handleFilterChange}
              filters={filters}
              onClearFilters={clearFilters}
            />
          </div>
        )}
      </Card>

      {/* Table Section */}
      <Card
        className="table-section"
        title={
          <div className="flex items-center justify-between">
            <span>Purchase Orders</span>
            <Space>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                size="small"
              >
                Export Excel
              </Button>
            </Space>
          </div>
        }
      >
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
      </Card>

      {/* GL Account Modal */}
      <GLAccountModal
        visible={showGLAccountModal}
        onClose={handleGLAccountModalClose}
        mode="manage"
        onSelect={handleGLAccountCreated}
      />
    </div>
  );
};
