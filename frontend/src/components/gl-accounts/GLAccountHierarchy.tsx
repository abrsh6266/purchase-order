import React from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Tooltip,
  Empty,
  Spin,
  Row,
  Col,
  Statistic,
  List,
  Tag,
} from 'antd';
import {
  FileOutlined,
  EyeOutlined,
  EditOutlined,
  SelectOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { GLAccount } from '../../types/glAccount';

const { Title, Text } = Typography;

interface GLAccountListProps {
  accounts: GLAccount[];
  loading: boolean;
  onEdit: (account: GLAccount) => void;
  onView: (account: GLAccount) => void;
  onSelect?: (account: GLAccount) => void;
}

export const GLAccountList: React.FC<GLAccountListProps> = ({
  accounts,
  loading,
  onEdit,
  onView,
  onSelect,
}) => {
  // Calculate statistics
  const stats = {
    totalAccounts: accounts.length,
    accountsWithLineItems: accounts.filter(acc => 
      acc._count && acc._count.lineItems > 0
    ).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Empty
        description="No GL accounts found"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="gl-account-list">
      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Total Accounts"
              value={stats.totalAccounts}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Accounts with Line Items"
              value={stats.accountsWithLineItems}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Account List */}
      <Card>
        <div className="mb-4">
          <Title level={4} className="mb-0">GL Accounts</Title>
          <Text type="secondary">
            Flat list of all GL accounts
          </Text>
        </div>

        <List
          dataSource={accounts}
          renderItem={(account) => (
            <List.Item
              key={account.id}
              className="border border-gray-200 rounded-lg p-4 mb-3 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileOutlined className="text-blue-500" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Text strong className="truncate">
                          {account.accountCode}
                        </Text>
                        <Tag color="blue">GL Account</Tag>
                      </div>
                      <Text type="secondary" className="text-sm truncate block">
                        {account.accountName}
                      </Text>
                      {account.description && (
                        <Text type="secondary" className="text-xs truncate block">
                          {account.description}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {account._count && (
                    <div className="flex gap-1">
                      {account._count.lineItems > 0 && (
                        <Tooltip title="Line Items">
                          <Tag color="purple">{account._count.lineItems}</Tag>
                        </Tooltip>
                      )}
                    </div>
                  )}
                  <Space size="small">
                    <Tooltip title="View Details">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => onView(account)}
                      />
                    </Tooltip>
                    <Tooltip title="Edit Account">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(account)}
                      />
                    </Tooltip>
                    {onSelect && (
                      <Tooltip title="Select Account">
                        <Button
                          type="primary"
                          size="small"
                          icon={<SelectOutlined />}
                          onClick={() => onSelect(account)}
                        >
                          Select
                        </Button>
                      </Tooltip>
                    )}
                  </Space>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Legend */}
      <Card className="mt-4">
        <Title level={5}>Legend</Title>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FileOutlined className="text-blue-500" />
            <Text>GL Account</Text>
          </div>
          <div className="flex items-center gap-2">
            <Tag color="blue">GL Account</Tag>
            <Text>Account Type</Text>
          </div>
          <div className="flex items-center gap-2">
            <Tag color="purple">5</Tag>
            <Text>Line Items</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}; 