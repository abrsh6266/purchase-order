import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Alert,
  Modal,
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
  PurchaseOrderStatus,
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
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    validateField,
    validateForm,
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
      vendorName: [{ required: true, message: "Vendor is required" }],
      poNumber: [
        { required: true, message: "PO number is required" },
        { min: 2, message: "PO number must be at least 2 characters" },
      ],
      apAccount: [{ required: true, message: "AP account is required" }],
      transactionType: [
        { required: true, message: "Transaction type is required" },
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
          glAccountId: item.glAccountId,
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
            glAccountId: data.glAccountId || "",
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
      glAccountId: "",
    };
    setLineItems([...lineItems, newLineItem]);
  };

  // Handle form field changes and sync with validation state
  const handleFormChange = (changedValues: any, _allValues: any) => {
    // Update validation state when form values change
    Object.keys(changedValues).forEach((key) => {
      setValue(key, changedValues[key]);

      // Handle validation for this field
      if (changedValues[key] && changedValues[key] !== "") {
        // Clear error for this field if it's now valid
        if (errors[key] && errors[key].length > 0) {
          // Validate the field to see if it's now valid
          const fieldErrors = validateField(key);
          if (fieldErrors.length === 0) {
            // Clear the error for this field by creating new errors object
            const newErrors = { ...errors };
            newErrors[key] = [];
            setErrors(newErrors);
          }
        }
      } else {
        // Field is empty - show error if it's required and has been touched
        const requiredFields = [
          "vendorName",
          "poNumber",
          "apAccount",
          "transactionType",
        ];
        if (requiredFields.includes(key) && touched[key]) {
          const fieldErrors = validateField(key);
          if (fieldErrors.length > 0) {
            const newErrors = { ...errors };
            newErrors[key] = fieldErrors;
            setErrors(newErrors);
          }
        }
      }
    });
  };

  // Function to validate all required fields and mark them as touched
  const validateAllFields = () => {
    const requiredFields = [
      "vendorName",
      "poNumber",
      "apAccount",
      "transactionType",
    ];

    requiredFields.forEach((field) => {
      validateField(field);
      // Mark field as touched to show error styling
      if (!values[field] || values[field] === "") {
        setError(field, "This field is required");
        setTouched(field, true);
      }
    });
  };

  const handleSubmit = async (action: "save" | "saveAndNew" | "submit") => {
    // Clear any previous form errors
    setFormError(null);

    try {
      // Validate all required fields first
      validateAllFields();

      // Validate form using both Ant Design and custom validation
      const formValues = await form.validateFields();

      // Also validate using our custom validation hook
      if (!validateForm()) {
        // Get validation errors and display them
        const validationErrors = Object.keys(errors)
          .map((field) => {
            if (errors[field] && errors[field].length > 0) {
              return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${
                errors[field][0]
              }`;
            }
            return null;
          })
          .filter(Boolean);

        setFormError(
          `Please fix the following validation errors:\n${validationErrors.join(
            "\n"
          )}`
        );
        return;
      }

      // Check if there are any line items
      if (lineItems.length === 0) {
        setFormError(
          "At least one line item is required. Please add a line item before submitting."
        );
        return;
      }

      // Validate each line item
      const invalidLineItems = lineItems.filter(
        (item) =>
          !item.item ||
          !item.glAccountId ||
          item.quantity <= 0 ||
          item.unitPrice <= 0
      );

      if (invalidLineItems.length > 0) {
        const missingFields = invalidLineItems.map((item, index) => {
          const errors = [];
          if (!item.item) errors.push("Item name");
          if (!item.glAccountId) errors.push("GL Account");
          if (item.quantity <= 0) errors.push("Quantity (must be > 0)");
          if (item.unitPrice <= 0) errors.push("Unit Price (must be > 0)");
          return `Line item ${index + 1}: ${errors.join(", ")}`;
        });
        setFormError(
          `Please fix the following issues:\n${missingFields.join("\n")}`
        );
        return;
      }

      // Determine the status based on the action
      const submitStatus =
        action === "save"
          ? PurchaseOrderStatus.DRAFT
          : PurchaseOrderStatus.SUBMITTED;

      const formData = {
        ...formValues,
        poDate: formValues.poDate
          ? formatDateForAPI(formValues.poDate)
          : undefined,
        lineItems: lineItems.map(({ id, ...lineItem }) => lineItem), // Remove id field before sending to API
        status: submitStatus, // Set status based on action
      };

      if (formData.poDate === "") {
        setFormError("Please select a valid PO date");
        return;
      }

      if (action === "save") {
        await onSave(formData);
      } else if (action === "submit") {
        await onSave(formData);
      } else {
        // saveAndNew - save as submitted and navigate to new form
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

  const handleSaveAsDraft = () => {
    handleSubmit("save");
  };

  const handleSaveAndNew = () => {
    Modal.confirm({
      title: "Save and Create New",
      content:
        "Are you sure you want to save this purchase order as submitted and create a new one?",
      okText: "Save & New",
      cancelText: "Cancel",
      onOk: () => handleSubmit("saveAndNew"),
    });
  };

  const handleSubmitWithConfirmation = () => {
    Modal.confirm({
      title: "Submit Purchase Order",
      content:
        "Are you sure you want to submit this purchase order? Once submitted, it will change from draft to submitted status and may require approval.",
      okText: "Submit",
      cancelText: "Cancel",
      onOk: () => handleSubmit("submit"),
    });
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
    ([_key, value]) => ({
      label: value,
      value: value,
    })
  );

  const transactionOriginOptions = Object.entries(TransactionOrigin).map(
    ([_key, value]) => ({
      label: value,
      value: value,
    })
  );

  const shipViaOptions = Object.entries(ShipVia).map(([_key, value]) => ({
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
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
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

      <Card
        title={
          <div>
            <div>Purchase Order Details</div>
            <div className="text-xs text-gray-500 mt-1">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </div>
          </div>
        }
        className="mb-4 md:mb-6"
      >
        {/* Status Indicator */}
        {isEditing && initialData && (
          <div className="mb-4">
            <Alert
              message={`Current Status: ${initialData.status}`}
              type={
                initialData.status === PurchaseOrderStatus.DRAFT
                  ? "info"
                  : "success"
              }
              showIcon
              description={
                initialData.status === PurchaseOrderStatus.DRAFT
                  ? "This purchase order is currently in draft status. You can continue editing and save as draft or submit when ready."
                  : "This purchase order has been submitted."
              }
            />
          </div>
        )}

        {/* Draft Mode Indicator for New Purchase Orders */}
        {!isEditing && (
          <div className="mb-4">
            <Alert
              message="Draft Mode"
              type="info"
              showIcon
              description="New purchase orders are automatically saved as drafts. You can continue editing and save as draft or submit when ready."
            />
          </div>
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label={
                <span className="text-sm font-medium">
                  Vendor <span className="text-red-500">*</span>
                </span>
              }
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
                placeholder="Select vendor (required)"
                options={vendorOptions}
                showSearch
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label={
                <span className="text-sm font-medium">One Time Vendor</span>
              }
              name="oneTimeVendor"
            >
              <Input placeholder="Enter one-time vendor name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label={<span className="text-sm font-medium">PO Date</span>}
              name="poDate"
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Select PO date"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label={
                <span className="text-sm font-medium">
                  PO Number <span className="text-red-500">*</span>
                </span>
              }
              name="poNumber"
              validateStatus={
                errors.poNumber && touched.poNumber ? "error" : ""
              }
              help={
                errors.poNumber && touched.poNumber ? errors.poNumber[0] : ""
              }
            >
              <Input placeholder="Enter PO number (required)" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label={<span className="text-sm font-medium">Customer SO</span>}
              name="customerSO"
            >
              <Input placeholder="Enter customer SO" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label={
                <span className="text-sm font-medium">Customer Invoice</span>
              }
              name="customerInvoice"
            >
              <Input placeholder="Enter customer invoice" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label={
                <span className="text-sm font-medium">
                  AP Account <span className="text-red-500">*</span>
                </span>
              }
              name="apAccount"
              validateStatus={
                errors.apAccount && touched.apAccount ? "error" : ""
              }
              help={
                errors.apAccount && touched.apAccount ? errors.apAccount[0] : ""
              }
            >
              <Select
                placeholder="Select AP account (required)"
                options={apAccountOptions}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label={
                <span className="text-sm font-medium">
                  Transaction Type <span className="text-red-500">*</span>
                </span>
              }
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
                placeholder="Select transaction type (required)"
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
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <span>Line Items</span>
              <Button
                type="dashed"
                onClick={handleAddLineItem}
                className="w-full sm:w-auto"
              >
                Add Line Item
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              At least one line item is required.
            </div>
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
          <Button
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          {isEditing && onDelete && (
            <Button
              danger
              onClick={onDelete}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="default"
            onClick={handleSaveAsDraft}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Save as Draft
          </Button>
          <Button
            onClick={handleSaveAndNew}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Save & New
          </Button>
          <Button
            type="primary"
            onClick={handleSubmitWithConfirmation}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Submit
          </Button>
        </div>
      </div>
    </Form>
  );
};
