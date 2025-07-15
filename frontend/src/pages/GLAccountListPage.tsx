import React, { useState, useEffect, useCallback } from "react";
import { Tabs, Button, Space, Alert, Card } from "antd";
import { PlusOutlined, BookOutlined } from "@ant-design/icons";
import { GLAccount } from "../types/glAccount";
import { useGLAccounts } from "../hooks/useGLAccounts";
import { GLAccountForm } from "../components/gl-accounts/GLAccountForm";
import { GLAccountList } from "../components/gl-accounts/GLAccountList";

export const GLAccountListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GLAccount | null>(null);

  const {
    glAccounts,
    loading,
    error,
    pagination,
    filters,
    fetchGLAccounts,
    createGLAccount,
    updateGLAccount,
    deleteGLAccount,
    clearError,
    setFilters,
  } = useGLAccounts({
    autoFetch: true,
    pageSize: 10,
  });

  const handleCreateNew = useCallback(() => {
    setEditingAccount(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((account: GLAccount) => {
    setEditingAccount(account);
    setShowForm(true);
  }, []);

  const handleView = useCallback((account: GLAccount) => {
    setActiveTab("details");
  }, []);

  const handleDelete = useCallback(
    async (account: GLAccount) => {
      try {
        await deleteGLAccount(account.id);
        fetchGLAccounts();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    [deleteGLAccount, fetchGLAccounts]
  );

  const handleFormSubmit = useCallback(
    async (data: any) => {
      try {
        if (editingAccount) {
          await updateGLAccount(editingAccount.id, data);
        } else {
          await createGLAccount(data);
        }
        setShowForm(false);
        setEditingAccount(null);
        fetchGLAccounts();
      } catch (error) {
        console.error("Form submission failed:", error);
      }
    },
    [editingAccount, updateGLAccount, createGLAccount, fetchGLAccounts]
  );

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingAccount(null);
  }, []);

  const handleFiltersChange = useCallback(
    (newFilters: any) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const handleRefresh = useCallback(() => {
    fetchGLAccounts();
  }, [fetchGLAccounts]);

  const getTabItems = useCallback(() => {
    const items = [
      {
        key: "list",
        label: (
          <span>
            <BookOutlined />
            Account List
          </span>
        ),
        children: (
          <GLAccountList
            accounts={glAccounts}
            loading={loading}
            pagination={pagination}
            filters={filters}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onFiltersChange={handleFiltersChange}
            onRefresh={handleRefresh}
            showActions={true}
          />
        ),
      },
    ];

    return items;
  }, [
    glAccounts,
    loading,
    pagination,
    filters,
    handleEdit,
    handleView,
    handleDelete,
    handleFiltersChange,
    handleRefresh,
  ]);

  if (showForm) {
    return (
      <div style={{ padding: "24px" }}>
        <Card
          title={editingAccount ? "Edit GL Account" : "Create New GL Account"}
          extra={
            <Button onClick={handleFormCancel}>
              Back to List
            </Button>
          }
        >
          <GLAccountForm
            initialData={editingAccount}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={loading}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={clearError}
          className="mb-4"
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            Create New Account
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={getTabItems()}
          type="card"
          size="large"
        />
      </Card>
    </div>
  );
}; 