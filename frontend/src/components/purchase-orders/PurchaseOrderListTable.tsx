import React from 'react';
import { Table, Button, Space, Tag, Popconfirm } from 'antd';
import { PurchaseOrder } from '../../types/purchaseOrder';
import { PurchaseOrderStatus } from '../../types/common';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/numberUtils';

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

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      sorter: true,
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      key: 'vendorName',
      sorter: true,
    },
    {
      title: 'PO Date',
      dataIndex: 'poDate',
      key: 'poDate',
      sorter: true,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: true,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status: PurchaseOrderStatus) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PurchaseOrder) => (
        <Space size="small">
          <Button
            type="text"
            onClick={() => onEdit(record.id)}
            title="View/Edit"
          >
            View
          </Button>
          <Button
            type="text"
            onClick={() => onEdit(record.id)}
            title="Edit"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this purchase order?"
            description="This action cannot be undone."
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Button
              type="text"
              danger
              title="Delete"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
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
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
        pageSizeOptions: ['10', '20', '50', '100'],
      } : false}
      scroll={{ x: 800 }}
    />
  );
}; 