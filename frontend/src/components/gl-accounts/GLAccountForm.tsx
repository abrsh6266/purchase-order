import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Card,
  Typography,
  Row,
  Col,
  Alert,
  Divider,
  Tooltip,
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  BankOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { GLAccount, CreateGLAccountDto, UpdateGLAccountDto } from '../../types/glAccount';
import { useGLAccounts } from '../../hooks/useGLAccounts';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface GLAccountFormProps {
  initialData?: GLAccount | null;
  onSubmit: (data: CreateGLAccountDto | UpdateGLAccountDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const GLAccountForm: React.FC<GLAccountFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        accountCode: initialData.accountCode,
        accountName: initialData.accountName,
        description: initialData.description || '',
      });
    } else {
      form.setFieldsValue({
        accountCode: '',
        accountName: '',
        description: '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission failed:', error);
      setFormError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <div className="gl-account-form">
      <Card>
        <div className="mb-6">
          <Title level={3} className="flex items-center gap-2">
            <BankOutlined />
            {isEditing ? 'Edit GL Account' : 'Create New GL Account'}
          </Title>
          <Text type="secondary">
            {isEditing 
              ? 'Update the general ledger account information below.'
              : 'Fill in the details to create a new general ledger account.'
            }
          </Text>
        </div>

        {formError && (
          <Alert
            message="Form Error"
            description={formError}
            type="error"
            showIcon
            closable
            onClose={() => setFormError(null)}
            className="mb-4"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="space-y-4"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-1">
                    <Text strong>Account Code</Text>
                    <span className="text-red-500">*</span>
                    <Tooltip title="Unique identifier for the account (e.g., 1000, 2000)">
                      <InfoCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="accountCode"
                rules={[
                  { required: true, message: 'Account code is required' },
                  { min: 2, message: 'Account code must be at least 2 characters' },
                  { max: 20, message: 'Account code cannot exceed 20 characters' },
                  {
                    pattern: /^[A-Za-z0-9\-_]+$/,
                    message: 'Account code can only contain letters, numbers, hyphens, and underscores',
                  },
                ]}
              >
                <Input
                  placeholder="e.g., 1000, 2000, CASH-001"
                  prefix={<BankOutlined />}
                  disabled={isSubmitting}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-1">
                    <Text strong>Account Name</Text>
                    <span className="text-red-500">*</span>
                    <Tooltip title="Descriptive name for the account">
                      <InfoCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="accountName"
                rules={[
                  { required: true, message: 'Account name is required' },
                  { min: 2, message: 'Account name must be at least 2 characters' },
                  { max: 100, message: 'Account name cannot exceed 100 characters' },
                ]}
              >
                <Input
                  placeholder="e.g., Cash, Accounts Payable, Sales Revenue"
                  prefix={<FileTextOutlined />}
                  disabled={isSubmitting}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-1">
                    <Text strong>Description</Text>
                    <Tooltip title="Additional details about the account">
                      <InfoCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="description"
              >
                <TextArea
                  placeholder="Enter a detailed description of this account..."
                  rows={3}
                  maxLength={500}
                  showCount
                  disabled={isSubmitting}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3">
            <Button
              onClick={handleCancel}
              disabled={isSubmitting}
              icon={<CloseOutlined />}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting || loading}
              icon={<SaveOutlined />}
            >
              {isEditing ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}; 