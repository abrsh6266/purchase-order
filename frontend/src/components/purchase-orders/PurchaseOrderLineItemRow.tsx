import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Row, Col } from 'antd';
import { PurchaseOrderLineItem, CreatePurchaseOrderLineItemDto } from '../../types/purchaseOrder';
import { formatCurrency } from '../../utils/numberUtils';

const { TextArea } = Input;

interface PurchaseOrderLineItemRowProps {
  data: Partial<PurchaseOrderLineItem> | CreatePurchaseOrderLineItemDto;
  id: string;
  onUpdate: (id: string, data: Partial<PurchaseOrderLineItem> | CreatePurchaseOrderLineItemDto) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const PurchaseOrderLineItemRow: React.FC<PurchaseOrderLineItemRowProps> = ({
  data,
  id,
  onUpdate,
  onRemove,
  disabled = false
}) => {
  const [localData, setLocalData] = useState<Partial<PurchaseOrderLineItem> | CreatePurchaseOrderLineItemDto>({
    item: '',
    quantity: 1,
    unitPrice: 1, // Changed from 0 to 1 to meet backend validation
    description: '',
    glAccount: '',
    ...data
  });

  const [amount, setAmount] = useState(0);

  // Calculate amount whenever quantity or unitPrice changes
  useEffect(() => {
    const quantity = localData.quantity || 0;
    const unitPrice = localData.unitPrice || 0;
    const calculatedAmount = quantity * unitPrice;
    setAmount(calculatedAmount);
  }, [localData.quantity, localData.unitPrice]);

  const handleFieldChange = (field: keyof CreatePurchaseOrderLineItemDto, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onUpdate(id, updatedData);
  };

  // Mock data for dropdowns - in a real app, these would come from API
  const itemOptions = [
    { label: 'Office Supplies', value: 'office_supplies' },
    { label: 'Computer Equipment', value: 'computer_equipment' },
    { label: 'Furniture', value: 'furniture' },
    { label: 'Software License', value: 'software_license' },
    { label: 'Consulting Services', value: 'consulting_services' },
  ];

  const glAccountOptions = [
    { label: '1000 - Cash', value: '1000' },
    { label: '1100 - Accounts Receivable', value: '1100' },
    { label: '1200 - Inventory', value: '1200' },
    { label: '1300 - Prepaid Expenses', value: '1300' },
    { label: '2000 - Accounts Payable', value: '2000' },
    { label: '3000 - Equity', value: '3000' },
    { label: '4000 - Revenue', value: '4000' },
    { label: '5000 - Cost of Goods Sold', value: '5000' },
    { label: '6000 - Operating Expenses', value: '6000' },
  ];

  return (
    <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4 bg-gray-50">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item *
            </label>
            <Select
              value={localData.item}
              onChange={(value) => handleFieldChange('item', value)}
              placeholder="Select item"
              options={itemOptions}
              disabled={disabled}
              style={{ width: '100%' }}
              status={!localData.item ? 'error' : ''}
            />
            {!localData.item && (
              <div className="text-red-500 text-xs mt-1">Item is required</div>
            )}
          </div>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <Input
              type="number"
              min={1}
              value={localData.quantity}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                // Ensure minimum value of 1
                const validValue = value > 0 ? value : 1;
                handleFieldChange('quantity', validValue);
              }}
              disabled={disabled}
              placeholder="Qty (min: 1)"
            />
          </div>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price *
            </label>
            <Input
              type="number"
              min={1}
              step={0.01}
              value={localData.unitPrice}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                // Ensure minimum value of 1
                const validValue = value > 0 ? value : 1;
                handleFieldChange('unitPrice', validValue);
              }}
              disabled={disabled}
              placeholder="Price (min: 1)"
            />
          </div>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="p-2 bg-white border border-gray-300 rounded text-sm font-medium text-center">
              {formatCurrency(amount)}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GL Account *
            </label>
            <Select
              value={localData.glAccount}
              onChange={(value) => handleFieldChange('glAccount', value)}
              placeholder="Select account"
              options={glAccountOptions}
              disabled={disabled}
              style={{ width: '100%' }}
              status={!localData.glAccount ? 'error' : ''}
            />
            {!localData.glAccount && (
              <div className="text-red-500 text-xs mt-1">GL Account is required</div>
            )}
          </div>
        </Col>

        <Col xs={24} sm={24} md={3}>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actions
            </label>
            <Button
              type="text"
              danger
              onClick={() => onRemove(id)}
              disabled={disabled}
              style={{ width: '100%' }}
            >
              Remove
            </Button>
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <TextArea
              value={localData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Enter item description"
              rows={2}
              disabled={disabled}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}; 