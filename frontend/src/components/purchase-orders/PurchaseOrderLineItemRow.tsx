import React, { useState, useEffect, useCallback } from "react";
import {
  Input,
  Select,
  Button,
  Row,
  Col,
  Space,
  Tooltip,
  Card,
  Divider,
  Tag,
  Badge,
} from "antd";
import {
  BankOutlined,
  DeleteOutlined,
  EditOutlined,
  CalculatorOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  PurchaseOrderLineItem,
  CreatePurchaseOrderLineItemDto,
} from "../../types/purchaseOrder";
import { formatCurrency } from "../../utils/numberUtils";
import { useGLAccounts } from "../../hooks/useGLAccounts";
import { GLAccountOption, GLAccount } from "../../types/glAccount";
import { GLAccountModal } from "../gl-accounts/GLAccountModal";

const { TextArea } = Input;

interface PurchaseOrderLineItemRowProps {
  data: Partial<PurchaseOrderLineItem> | CreatePurchaseOrderLineItemDto;
  id: string;
  onUpdate: (
    id: string,
    data: Partial<PurchaseOrderLineItem> | CreatePurchaseOrderLineItemDto
  ) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const PurchaseOrderLineItemRow: React.FC<
  PurchaseOrderLineItemRowProps
> = ({ data, id, onUpdate, onRemove, disabled = false }) => {
  const [localData, setLocalData] = useState<
    Partial<PurchaseOrderLineItem> | CreatePurchaseOrderLineItemDto
  >({
    item: "",
    quantity: 1,
    unitPrice: 1,
    description: "",
    glAccountId: "",
    ...data,
  });

  const [amount, setAmount] = useState(0);
  const [glAccountOptions, setGlAccountOptions] = useState<GLAccountOption[]>(
    []
  );
  const [showGLAccountModal, setShowGLAccountModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get GL accounts for dropdown
  const { getAccountOptions } = useGLAccounts({ autoFetch: false });

  // Load GL account options - memoized to prevent infinite loops
  const loadGLAccountOptions = useCallback(async () => {
    try {
      const options = await getAccountOptions();
      setGlAccountOptions(options);
    } catch (error) {
      console.error("Failed to load GL accounts:", error);
    }
  }, [getAccountOptions]);

  // Load GL account options on mount
  useEffect(() => {
    loadGLAccountOptions();
  }, [loadGLAccountOptions]);

  // Calculate amount whenever quantity or unitPrice changes
  useEffect(() => {
    const quantity = localData.quantity || 0;
    const unitPrice = localData.unitPrice || 0;
    const calculatedAmount = quantity * unitPrice;
    setAmount(calculatedAmount);
  }, [localData.quantity, localData.unitPrice]);

  const handleFieldChange = useCallback(
    (field: keyof CreatePurchaseOrderLineItemDto, value: any) => {
      const updatedData = { ...localData, [field]: value };
      setLocalData(updatedData);
      onUpdate(id, updatedData);
    },
    [localData, onUpdate, id]
  );

  const handleGLAccountSelect = useCallback(
    (account: GLAccount) => {
      handleFieldChange("glAccountId", account.id);
      // Refresh the options to include the newly selected account
      loadGLAccountOptions();
    },
    [handleFieldChange, loadGLAccountOptions]
  );

  // Mock data for dropdowns - in a real app, these would come from API
  const itemOptions = [
    { label: "Office Supplies", value: "office_supplies" },
    { label: "Computer Equipment", value: "computer_equipment" },
    { label: "Furniture", value: "furniture" },
    { label: "Software License", value: "software_license" },
    { label: "Consulting Services", value: "consulting_services" },
  ];

  // Get the selected account name for display
  const selectedAccount = glAccountOptions.find(
    (option) => option.value === localData.glAccountId
  );

  // Validation states
  const hasErrors = !localData.item || !localData.glAccountId;


  return (
    <Card
      className={`mb-4 transition-all duration-300 hover:shadow-md ${
        hasErrors ? "border-red-300 bg-red-50" : "border-gray-200"
      }`}
      size="small"
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {hasErrors && <Badge status="error" text="Incomplete" />}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemove(id)}
              disabled={disabled}
              className="hover:bg-red-50"
            />
          </div>
        </div>
      }
    >
      {/* Compact View (when not expanded) */}
      {!isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Item:</span>
            <span className="text-sm">
              {localData.item || (
                <span className="text-red-500 italic">Not selected</span>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">
              Qty × Price:
            </span>
            <span className="text-sm">
              {localData.quantity} × {formatCurrency(localData.unitPrice || 0)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Total:</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(amount)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Account:</span>
            <span className="text-sm">
              {selectedAccount?.label || (
                <span className="text-red-500 italic">Not selected</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Main Fields Row */}
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Item <span className="text-red-500">*</span>
                </label>
                <Select
                  value={localData.item}
                  onChange={(value) => handleFieldChange("item", value)}
                  placeholder="Select item"
                  options={itemOptions}
                  disabled={disabled}
                  size="large"
                  status={!localData.item ? "error" : ""}
                  className="w-full"
                />
                {!localData.item && (
                  <div className="text-red-500 text-xs flex items-center space-x-1">
                    <InfoCircleOutlined />
                    <span>Item is required</span>
                  </div>
                )}
              </div>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  value={localData.quantity}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    const validValue = value > 0 ? value : 1;
                    handleFieldChange("quantity", validValue);
                  }}
                  disabled={disabled}
                  size="large"
                  prefix={<span className="text-gray-400">Qty</span>}
                  className="w-full"
                />
              </div>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Unit Price <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={localData.unitPrice}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    const validValue = value > 0 ? value : 0.01;
                    handleFieldChange("unitPrice", validValue);
                  }}
                  disabled={disabled}
                  size="large"
                  prefix={<span className="text-gray-400">$</span>}
                  className="w-full"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Total Amount
                </label>
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Calculated Total:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {localData.quantity} ×{" "}
                    {formatCurrency(localData.unitPrice || 0)}
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <Divider />

          {/* GL Account Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                GL Account <span className="text-red-500">*</span>
              </label>
              <Tooltip title="Manage GL Accounts">
                <Button
                  type="primary"
                  icon={<BankOutlined />}
                  onClick={() => setShowGLAccountModal(true)}
                  disabled={disabled}
                  size="small"
                >
                  Manage Accounts
                </Button>
              </Tooltip>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Select
                  value={localData.glAccountId}
                  onChange={(value) => handleFieldChange("glAccountId", value)}
                  placeholder="Select GL account"
                  options={glAccountOptions}
                  disabled={disabled}
                  size="large"
                  status={!localData.glAccountId ? "error" : ""}
                  showSearch
                  optionFilterProp="label"
                  className="w-full"
                />
              </Col>
            </Row>

                         {selectedAccount && (
               <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                 <div className="flex-1">
                   <div className="font-medium text-green-800">
                     {selectedAccount.accountName}
                   </div>
                   <div className="text-sm text-green-600">
                     {selectedAccount.accountCode}
                   </div>
                 </div>
                 <Tag color="green">{selectedAccount.value}</Tag>
               </div>
             )}

            {!localData.glAccountId && (
              <div className="text-red-500 text-xs flex items-center space-x-1 p-2 bg-red-50 border border-red-200 rounded">
                <InfoCircleOutlined />
                <span>GL Account is required</span>
              </div>
            )}
          </div>

          <Divider />

          {/* Description Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <TextArea
              value={localData.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Enter detailed description of this line item..."
              rows={3}
              disabled={disabled}
              className="w-full"
              showCount
              maxLength={500}
            />
          </div>
        </div>
      )}

      {/* GL Account Modal */}
      <GLAccountModal
        visible={showGLAccountModal}
        onClose={() => setShowGLAccountModal(false)}
        onSelect={handleGLAccountSelect}
        mode="select"
      />
    </Card>
  );
};
