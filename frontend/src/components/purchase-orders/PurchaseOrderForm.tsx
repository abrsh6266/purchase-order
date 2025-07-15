import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Card, Divider, Typography, Row, Col } from 'antd';
import { PurchaseOrder, CreatePurchaseOrderDto, UpdatePurchaseOrderDto, CreatePurchaseOrderLineItemDto, PurchaseOrderLineItem } from '../../types/purchaseOrder';
import { TransactionType, TransactionOrigin, ShipVia, PurchaseOrderStatus } from '../../types/common';
import { PurchaseOrderLineItemRow } from './PurchaseOrderLineItemRow';
import { formatCurrency } from '../../utils/numberUtils';
import { formatDateForAPI } from '../../utils/dateUtils';
import { useFormValidation } from '../../hooks/useFormValidation';

const { TextArea } = Input;
const { Title } = Typography;

interface PurchaseOrderFormProps {
  initialData?: PurchaseOrder | null;
  isEditing?: boolean;
  onSave: (data: CreatePurchaseOrderDto | UpdatePurchaseOrderDto) => void;
  onSaveAndNew: (data: CreatePurchaseOrderDto | UpdatePurchaseOrderDto) => void;
  onDelete?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  initialData,
  isEditing = false,
  onSave,
  onSaveAndNew,
  onDelete,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [lineItems, setLineItems] = useState<CreatePurchaseOrderLineItemDto[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Form validation is handled by Ant Design Form component

  // Initialize form with data
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        vendorName: initialData.vendorName,
        oneTimeVendor: initialData.oneTimeVendor,
        poDate: initialData.poDate ? new Date(initialData.poDate) : undefined,
        poNumber: initialData.poNumber,
        customerSO: initialData.customerSO,
        customerInvoice: initialData.customerInvoice,
        apAccount: initialData.apAccount,
        transactionType: initialData.transactionType,
        transactionOrigin: initialData.transactionOrigin,
        shipVia: initialData.shipVia,
      });

      // Convert line items to the format expected by the form
      const formattedLineItems = initialData.lineItems.map(item => ({
        item: item.item,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        description: item.description || '',
        glAccount: item.glAccount,
      }));
      setLineItems(formattedLineItems);
    } else {
      // Set default values for new purchase order
      form.setFieldsValue({
        poDate: new Date(),
        transactionType: TransactionType.GOODS,
      });
      // Add one empty line item
      setLineItems([{
        item: '',
        quantity: 1,
        unitPrice: 0,
        description: '',
        glAccount: '',
      }]);
    }
  }, [initialData, form]);

  // Calculate total amount whenever line items change
  useEffect(() => {
    const total = lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    setTotalAmount(total);
  }, [lineItems]);

  const handleLineItemUpdate = (index: number, data: CreatePurchaseOrderLineItemDto | Partial<PurchaseOrderLineItem>) => {
    const updatedLineItems = [...lineItems];
    // Ensure the data has all required fields for CreatePurchaseOrderLineItemDto
    const lineItemData: CreatePurchaseOrderLineItemDto = {
      item: data.item || '',
      quantity: data.quantity || 1,
      unitPrice: data.unitPrice || 0,
      description: data.description || '',
      glAccount: data.glAccount || '',
    };
    updatedLineItems[index] = lineItemData;
    setLineItems(updatedLineItems);
  };

  const handleLineItemRemove = (index: number) => {
    if (lineItems.length > 1) {
      const updatedLineItems = lineItems.filter((_, i) => i !== index);
      setLineItems(updatedLineItems);
    }
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, {
      item: '',
      quantity: 1,
      unitPrice: 0,
      description: '',
      glAccount: '',
    }]);
  };

  const handleSubmit = async (action: 'save' | 'saveAndNew') => {
    try {
      const values = await form.validateFields();
      
      // Validate line items
      if (lineItems.length === 0) {
        throw new Error('At least one line item is required');
      }

      const hasInvalidLineItems = lineItems.some(item => 
        !item.item || !item.glAccount || item.quantity <= 0 || item.unitPrice < 0
      );

      if (hasInvalidLineItems) {
        throw new Error('Please fill in all required fields for line items');
      }

      const formData = {
        ...values,
        poDate: values.poDate ? formatDateForAPI(values.poDate) : undefined,
        lineItems: lineItems,
      };

      if (action === 'save') {
        onSave(formData);
      } else {
        onSaveAndNew(formData);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Mock data for dropdowns - in a real app, these would come from API
  const vendorOptions = [
    { label: 'ABC Supplies Inc.', value: 'ABC Supplies Inc.' },
    { label: 'XYZ Corporation', value: 'XYZ Corporation' },
    { label: 'Tech Solutions Ltd.', value: 'Tech Solutions Ltd.' },
    { label: 'Office Depot', value: 'Office Depot' },
  ];

  const apAccountOptions = [
    { label: '2000 - Accounts Payable', value: '2000' },
    { label: '2100 - Accrued Expenses', value: '2100' },
    { label: '2200 - Notes Payable', value: '2200' },
  ];

  const transactionTypeOptions = Object.entries(TransactionType).map(([key, value]) => ({
    label: value,
    value: value
  }));

  const transactionOriginOptions = Object.entries(TransactionOrigin).map(([key, value]) => ({
    label: value,
    value: value
  }));

  const shipViaOptions = Object.entries(ShipVia).map(([key, value]) => ({
    label: value,
    value: value
  }));

  return (
    <Form
      form={form}
      layout="vertical"
      className="space-y-6"
    >
      {/* Header Fields Section */}
      <Card title="Purchase Order Details" className="mb-6">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Vendor"
              name="vendorName"
              rules={[{ required: true, message: 'Please select a vendor' }]}
            >
              <Select
                placeholder="Select vendor"
                options={vendorOptions}
                showSearch
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="One Time Vendor"
              name="oneTimeVendor"
            >
              <Input placeholder="Enter one-time vendor name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="PO Date"
              name="poDate"
              rules={[{ required: true, message: 'Please select PO date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="PO Number"
              name="poNumber"
              rules={[{ required: true, message: 'Please enter PO number' }]}
            >
              <Input placeholder="Enter PO number" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Customer SO"
              name="customerSO"
            >
              <Input placeholder="Enter customer SO" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Customer Invoice"
              name="customerInvoice"
            >
              <Input placeholder="Enter customer invoice" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="AP Account"
              name="apAccount"
              rules={[{ required: true, message: 'Please select AP account' }]}
            >
              <Select
                placeholder="Select AP account"
                options={apAccountOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Transaction Type"
              name="transactionType"
              rules={[{ required: true, message: 'Please select transaction type' }]}
            >
              <Select
                placeholder="Select transaction type"
                options={transactionTypeOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Transaction Origin"
              name="transactionOrigin"
            >
              <Select
                placeholder="Select transaction origin"
                options={transactionOriginOptions}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ship Via"
              name="shipVia"
            >
              <Select
                placeholder="Select shipping method"
                options={shipViaOptions}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Line Items Section */}
      <Card 
        title={
          <div className="flex justify-between items-center">
            <span>Line Items</span>
            <Button type="dashed" onClick={handleAddLineItem}>
              Add Line Item
            </Button>
          </div>
        }
        className="mb-6"
      >
        {lineItems.map((item, index) => (
          <PurchaseOrderLineItemRow
            key={index}
            data={item}
            index={index}
            onUpdate={handleLineItemUpdate}
            onRemove={handleLineItemRemove}
            disabled={loading}
          />
        ))}
      </Card>

      {/* Total Amount Display */}
      <Card className="mb-6">
        <div className="text-right">
          <Title level={4}>
            Total Amount: {formatCurrency(totalAmount)}
          </Title>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Space>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          {isEditing && onDelete && (
            <Button danger onClick={onDelete} disabled={loading}>
              Delete
            </Button>
          )}
        </Space>
        
        <Space>
          <Button 
            type="primary" 
            onClick={() => handleSubmit('save')}
            loading={loading}
          >
            Save
          </Button>
          <Button 
            onClick={() => handleSubmit('saveAndNew')}
            loading={loading}
          >
            Save & New
          </Button>
        </Space>
      </div>
    </Form>
  );
}; 