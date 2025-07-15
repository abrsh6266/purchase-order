import React from 'react';
import { Table, Button, Space, Tag, Popconfirm, Tooltip, Typography, Avatar } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { PurchaseOrder } from '../../types/purchaseOrder';
import { PurchaseOrderStatus } from '../../types/common';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/numberUtils';

const { Text, Link } = Typography;

interface PurchaseOrderListTableProps {
  data: PurchaseOrder[];
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTableChange?: (pagination: any, filters: any, sorter: any) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const PurchaseOrderListTable: React.FC<PurchaseOrderListTableProps> = ({
  data,
  loading = false,
  onEdit,
  onDelete,
  onTableChange,
  pagination
}) => {
  const getStatusColor = (status: PurchaseOrderStatus) => {
    const statusColors: Record<PurchaseOrderStatus, string> = {
      DRAFT: 'default',
      SUBMITTED: 'processing',
    };
    return statusColors[status] || 'default';
  };

  const getStatusIcon = (status: PurchaseOrderStatus) => {
    const statusIcons: Record<PurchaseOrderStatus, React.ReactNode> = {
      DRAFT: <FileTextOutlined />,
      SUBMITTED: <CalendarOutlined />,
    };
    return statusIcons[status] || <FileTextOutlined />;
  };

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      sorter: true,
      render: (text: string, record: PurchaseOrder) => (
        <div className="flex items-center gap-2">
          <Avatar 
            size="small" 
            icon={<FileTextOutlined />} 
            className="bg-blue-100 text-blue-600"
          />
          <div>
            <Link 
              strong 
              onClick={() => onEdit(record.id)}
              className="text-blue-600 hover:text-blue-800"
            >
              {text}
            </Link>
            <div className="text-xs text-gray-500">
              ID: {record.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendorName',
      key: 'vendorName',
      sorter: true,
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            className="bg-green-100 text-green-600"
          />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: 'PO Date',
      dataIndex: 'poDate',
      key: 'poDate',
      sorter: true,
      render: (date: string) => (
        <div className="flex items-center gap-1">
          <CalendarOutlined className="text-gray-400" />
          <Text>{formatDate(date)}</Text>
        </div>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: true,
      render: (amount: number) => (
        <div className="flex items-center gap-1">
          <DollarOutlined className="text-green-500" />
          <Text strong className="text-green-600">
            {formatCurrency(amount)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status: PurchaseOrderStatus) => (
        <Tag 
          color={getStatusColor(status)}
          icon={getStatusIcon(status)}
          className="flex items-center gap-1 px-3 py-1"
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: PurchaseOrder) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onEdit(record.id)}
              size="small"
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Edit Purchase Order">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record.id)}
              size="small"
              className="text-green-600 hover:text-green-800"
            />
          </Tooltip>
          <Popconfirm
            title="Delete Purchase Order"
            description="Are you sure you want to delete this purchase order? This action cannot be undone."
            onConfirm={() => onDelete(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            placement="topRight"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Purchase Order">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
                className="hover:text-red-700"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="purchase-order-table">
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        onChange={onTableChange}
        pagination={pagination ? {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => (
            <span className="text-gray-600">
              Showing {range[0]}-{range[1]} of {total} purchase orders
            </span>
          ),
          pageSizeOptions: ['10', '20', '50', '100'],
          size: 'default',
        } : false}
        scroll={{ x: 1000 }}
        className="custom-table"
        rowClassName={(record, index) => 
          index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
        }
      />
    </div>
  );
}; 