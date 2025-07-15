import React, { useState, useEffect, useCallback } from "react";
import { Modal, Tabs, Button, Space, Alert } from "antd";
import { PlusOutlined, BookOutlined } from "@ant-design/icons";
import { GLAccount } from "../../types/glAccount";
import { useGLAccounts } from "../../hooks/useGLAccounts";
import { GLAccountForm } from "./GLAccountForm";
import { GLAccountList } from "./GLAccountList";

interface GLAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (account: GLAccount) => void;
  mode?: "select" | "manage";
  selectedAccountId?: string;
}

export const GLAccountModal: React.FC<GLAccountModalProps> = ({
  visible,
  onClose,
  onSelect,
  mode = "manage",
  selectedAccountId,
}) => {
  const [activeTab, setActiveTab] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GLAccount | null>(null);
  const [_viewingAccount, setViewingAccount] = useState<GLAccount | null>(null);

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
    getGLAccount,
    clearError,
    setFilters,
  } = useGLAccounts({
    autoFetch: true,
    pageSize: 10,
  });

  // Load selected account details if provided
  useEffect(() => {
    if (selectedAccountId && visible) {
      getGLAccount(selectedAccountId).catch(console.error);
    }
  }, [selectedAccountId, visible, getGLAccount]);

  const handleCreateNew = useCallback(() => {
    setEditingAccount(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((account: GLAccount) => {
    setEditingAccount(account);
    setShowForm(true);
  }, []);

  const handleView = useCallback((account: GLAccount) => {
    setViewingAccount(account);
    setActiveTab("details");
  }, []);

  const handleDelete = useCallback(
    async (account: GLAccount) => {
      try {
        await deleteGLAccount(account.id);
        // Refresh the list
        fetchGLAccounts();
      } catch (error) {
        // Error is handled by the hook
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
        // Refresh the list
        fetchGLAccounts();
      } catch (error) {
        // Error is handled by the hook
        console.error("Form submission failed:", error);
      }
    },
    [editingAccount, updateGLAccount, createGLAccount, fetchGLAccounts]
  );

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingAccount(null);
  }, []);

  const handleSelectAccount = useCallback(
    (account: GLAccount) => {
      if (onSelect) {
        onSelect(account);
        onClose();
      }
    },
    [onSelect, onClose]
  );

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
            onSelect={mode === "select" ? handleSelectAccount : undefined}
            onFiltersChange={handleFiltersChange}
            onRefresh={handleRefresh}
            showActions={mode === "manage"}
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
    handleSelectAccount,
    handleFiltersChange,
    handleRefresh,
    mode,
  ]);

  const renderModalTitle = useCallback(() => {
    if (showForm) {
      return editingAccount ? "Edit GL Account" : "Create New GL Account";
    }
    return mode === "select" ? "Select GL Account" : "GL Account Management";
  }, [showForm, editingAccount, mode]);

  const renderModalFooter = useCallback(() => {
    if (showForm) {
      return null; // Form handles its own footer
    }

    return (
      <Space>
        <Button onClick={onClose}>Close</Button>
        {mode === "manage" && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            Create New Account
          </Button>
        )}
      </Space>
    );
  }, [showForm, mode, onClose, handleCreateNew]);

  return (
    <Modal
      title={renderModalTitle()}
      open={visible}
      onCancel={onClose}
      footer={renderModalFooter()}
      width={1200}
      style={{ top: 20 }}
      destroyOnClose
    >
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

      {showForm ? (
        <GLAccountForm
          initialData={editingAccount}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={loading}
        />
      ) : (
        <div className="gl-account-modal-content">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={getTabItems()}
            type="card"
            size="large"
          />
        </div>
      )}
    </Modal>
  );
};
