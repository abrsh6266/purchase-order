import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Card,
  Typography,
  Row,
  Col,
} from "antd";
import {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  CreatePurchaseOrderLineItemDto,
  PurchaseOrderLineItem,
} from "../../types/purchaseOrder";
import {
  TransactionType,
  TransactionOrigin,
  ShipVia,
} from "../../types/common";
import { PurchaseOrderLineItemRow } from "./PurchaseOrderLineItemRow";
import { formatCurrency } from "../../utils/numberUtils";
import { formatDateForAPI } from "../../utils/dateUtils";
import { useFormValidation } from "../../hooks/useFormValidation";
import dayjs from "dayjs";

const { Title } = Typography;

interface LineItemWithId extends CreatePurchaseOrderLineItemDto {
  id: string;
}

interface PurchaseOrderFormProps {
  initialData?: PurchaseOrder | null;
  isEditing?: boolean;
  onSave: (
    data: CreatePurchaseOrderDto | UpdatePurchaseOrderDto
  ) => Promise<void>;
  onSaveAndNew: (
    data: CreatePurchaseOrderDto | UpdatePurchaseOrderDto
  ) => Promise<void>;
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
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [lineItems, setLineItems] = useState<LineItemWithId[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form validation
  const {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setValues,
    setError,
    setErrors,
    validateField,
    validateForm,
    resetForm,
    handleChange,
    handleBlur,
  } = useFormValidation({
    initialValues: {
      vendorName: "",
      oneTimeVendor: "",
      poDate: undefined,
      poNumber: "",
      customerSO: "",
      customerInvoice: "",
      apAccount: "",
      transactionType: TransactionType.GOODS,
      transactionOrigin: "",
      shipVia: "",
    },
    validationSchema: {
      vendorName: [{ required: true, message: "Please select a vendor" }],
      poDate: [{ required: true, message: "Please select PO date" }],
      poNumber: [
        { required: true, message: "Please enter PO number" },
        { min: 2, message: "PO number must be at least 2 characters" },
      ],
      apAccount: [{ required: true, message: "Please select AP account" }],
      transactionType: [
        { required: true, message: "Please select transaction type" },
      ],
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  useEffect(() => {
    if (initialData) {
      const formValues = {
        vendorName: initialData.vendorName,
        oneTimeVendor: initialData.oneTimeVendor,
        poDate: initialData.poDate ? dayjs(initialData.poDate) : undefined,
        poNumber: initialData.poNumber,
        customerSO: initialData.customerSO,
        customerInvoice: initialData.customerInvoice,
        apAccount: initialData.apAccount,
        transactionType: initialData.transactionType,
        transactionOrigin: initialData.transactionOrigin,
        shipVia: initialData.shipVia,
      };

      // Update both form and validation state
      form.setFieldsValue(formValues);
      setValues(formValues);

      const formattedLineItems: LineItemWithId[] = initialData.lineItems.map(
        (item) => ({
          id:
            item.id ||
            `line-item-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          item: item.item,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          description: item.description || "",
          glAccount: item.glAccount,
        })
      );
      setLineItems(formattedLineItems);
    } else {
      const defaultValues = {
        poDate: undefined,
        transactionType: TransactionType.GOODS,
      };
      form.setFieldsValue(defaultValues);
      setValues(defaultValues);
      // Start with no line items - user must add them
      setLineItems([]);
    }
  }, [initialData, form, setValues]);

  useEffect(() => {
    const total = lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);
    setTotalAmount(total);
  }, [lineItems]);

  const handleLineItemUpdate = (
    id: string,
    data: CreatePurchaseOrderLineItemDto | Partial<PurchaseOrderLineItem>
  ) => {
    const updatedLineItems = lineItems.map((item) =>
      item.id === id
        ? {
            ...item,
            item: data.item || "",
            quantity: data.quantity || 1,
            unitPrice: data.unitPrice || 1,
            description: data.description || "",
            glAccount: data.glAccount || "",
          }
        : item
    );
    setLineItems(updatedLineItems);
  };

  const handleLineItemRemove = (id: string) => {
    const updatedLineItems = lineItems.filter((item) => item.id !== id);
    setLineItems(updatedLineItems);
  };

  const handleAddLineItem = () => {
    const newLineItem: CreatePurchaseOrderLineItemDto & { id: string } = {
      id: `line-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      item: "",
      quantity: 1,
      unitPrice: 1,
      description: "",
      glAccount: "",
    };
    setLineItems([...lineItems, newLineItem]);
  };

  // Handle form field changes and sync with validation state
  const handleFormChange = (changedValues: any, allValues: any) => {
    // Update validation state when form values change
    Object.keys(changedValues).forEach((key) => {
      setValue(key, changedValues[key]);
    });
  };

    const handleSubmit = async (action: "save" | "saveAndNew") => {
    // Clear any previous form errors
    setFormError(null);
    
    try {
      // Validate form using both Ant Design and custom validation
      const formValues = await form.validateFields();

      // Also validate using our custom validation hook
      if (!validateForm()) {
        setFormError("Please fix the validation errors before submitting");
        return;
      }

      // Check if there are any line items
      if (lineItems.length === 0) {
        setFormError("At least one line item is required. Please add a line item before submitting.");
        return;
      }

      // Validate each line item
      const invalidLineItems = lineItems.filter(
        (item) => 
          !item.item || 
          !item.glAccount || 
          item.quantity <= 0 || 
          item.unitPrice <= 0
      );

      if (invalidLineItems.length > 0) {
        const missingFields = invalidLineItems.map((item, index) => {
          const errors = [];
          if (!item.item) errors.push("Item name");
          if (!item.glAccount) errors.push("GL Account");
          if (item.quantity <= 0) errors.push("Quantity (must be > 0)");
          if (item.unitPrice <= 0) errors.push("Unit Price (must be > 0)");
          return `Line item ${index + 1}: ${errors.join(", ")}`;
        });
        setFormError(`Please fix the following issues:\n${missingFields.join("\n")}`);
        return;
      }

      const formData = {
        ...formValues,
        poDate: formValues.poDate
          ? formatDateForAPI(formValues.poDate)
          : undefined,
        lineItems: lineItems.map(({ id, ...lineItem }) => lineItem), // Remove id field before sending to API
      };

      if (formData.poDate === "") {
        setFormError("Please select a valid PO date");
        return;
      }

      if (action === "save") {
        await onSave(formData);
      } else {
        await onSaveAndNew(formData);
      }
    } catch (error) {
      console.error("Form validation failed:", error);
      // Handle any other errors that might occur
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("An unexpected error occurred");
      }
    }
  };

  const vendorOptions = [
    { label: "ABC Supplies Inc.", value: "ABC Supplies Inc." },
    { label: "XYZ Corporation", value: "XYZ Corporation" },
    { label: "Tech Solutions Ltd.", value: "Tech Solutions Ltd." },
    { label: "Office Depot", value: "Office Depot" },
  ];

  const apAccountOptions = [
    { label: "2000 - Accounts Payable", value: "2000" },
    { label: "2100 - Accrued Expenses", value: "2100" },
    { label: "2200 - Notes Payable", value: "2200" },
  ];

  const transactionTypeOptions = Object.entries(TransactionType).map(
    ([key, value]) => ({
      label: value,
      value: value,
    })
  );

  const transactionOriginOptions = Object.entries(TransactionOrigin).map(
    ([key, value]) => ({
      label: value,
      value: value,
    })
  );

  const shipViaOptions = Object.entries(ShipVia).map(([key, value]) => ({
    label: value,
    value: value,
  }));

  return (
    <Form
      form={form}
      layout="vertical"
      className="space-y-4 md:space-y-6"
      onValuesChange={handleFormChange}
    >
             {/* Display form validation errors */}
       {formError && (
         <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
           <div className="flex items-start">
             <div className="flex-shrink-0">
               <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
               </svg>
             </div>
             <div className="ml-3 flex-1">
               <h3 className="text-sm font-medium text-red-800">
                 Form Validation Error
               </h3>
               <div className="mt-2 text-sm text-red-700 whitespace-pre-line break-words">
                 {formError}
               </div>
               <div className="mt-3">
                 <button
                   type="button"
                   onClick={() => setFormError(null)}
                   className="text-sm text-red-600 hover:text-red-500 font-medium"
                 >
                   Dismiss
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

      <Card title="Purchase Order Details" className="mb-4 md:mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label={<span className="text-sm font-medium">Vendor</span>}
              name="vendorName"
              validateStatus={
                errors.vendorName && touched.vendorName ? "error" : ""
              }
              help={
                errors.vendorName && touched.vendorName
                  ? errors.vendorName[0]
                  : ""
              }
            >
              <Select
                placeholder="Select vendor"
                options={vendorOptions}
                showSearch
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item label="One Time Vendor" name="oneTimeVendor">
              <Input placeholder="Enter one-time vendor name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="PO Date"
              name="poDate"
              validateStatus={errors.poDate && touched.poDate ? "error" : ""}
              help={errors.poDate && touched.poDate ? errors.poDate[0] : ""}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Select PO date"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="PO Number"
              name="poNumber"
              validateStatus={
                errors.poNumber && touched.poNumber ? "error" : ""
              }
              help={
                errors.poNumber && touched.poNumber ? errors.poNumber[0] : ""
              }
            >
              <Input placeholder="Enter PO number" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item label="Customer SO" name="customerSO">
              <Input placeholder="Enter customer SO" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Customer Invoice" name="customerInvoice">
              <Input placeholder="Enter customer invoice" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="AP Account"
              name="apAccount"
              validateStatus={
                errors.apAccount && touched.apAccount ? "error" : ""
              }
              help={
                errors.apAccount && touched.apAccount ? errors.apAccount[0] : ""
              }
            >
              <Select
                placeholder="Select AP account"
                options={apAccountOptions}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Transaction Type"
              name="transactionType"
              validateStatus={
                errors.transactionType && touched.transactionType ? "error" : ""
              }
              help={
                errors.transactionType && touched.transactionType
                  ? errors.transactionType[0]
                  : ""
              }
            >
              <Select
                placeholder="Select transaction type"
                options={transactionTypeOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Transaction Origin" name="transactionOrigin">
              <Select
                placeholder="Select transaction origin"
                options={transactionOriginOptions}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Ship Via" name="shipVia">
              <Select
                placeholder="Select shipping method"
                options={shipViaOptions}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

            <Card 
        title={
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <span>Line Items</span>
            <Button type="dashed" onClick={handleAddLineItem} className="w-full sm:w-auto">
              Add Line Item
            </Button>
          </div>
        }
        className="mb-4 md:mb-6"
      >
        {lineItems.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <p>No line items added yet.</p>
            <p className="text-sm">
              Click "Add Line Item" to start adding items to this purchase
              order.
            </p>
          </div>
        ) : (
          lineItems.map((item) => (
            <PurchaseOrderLineItemRow
              key={item.id}
              data={item}
              id={item.id}
              onUpdate={handleLineItemUpdate}
              onRemove={handleLineItemRemove}
              disabled={loading}
            />
          ))
        )}
      </Card>

      <Card className="mb-4 md:mb-6">
        <div className="text-center sm:text-right">
          <Title level={4} className="text-lg sm:text-xl">
            Total Amount: {formatCurrency(totalAmount)}
          </Title>
        </div>
      </Card>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onCancel} disabled={loading} className="w-full sm:w-auto">
            Cancel
          </Button>
          {isEditing && onDelete && (
            <Button danger onClick={onDelete} disabled={loading} className="w-full sm:w-auto">
              Delete
            </Button>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            type="primary" 
            onClick={() => handleSubmit("save")}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Save
          </Button>
          <Button 
            onClick={() => handleSubmit("saveAndNew")} 
            loading={loading}
            className="w-full sm:w-auto"
          >
            Save & New
          </Button>
        </div>
      </div>
    </Form>
  );
};
