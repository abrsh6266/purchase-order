import React, { useMemo } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  BankOutlined,
  FileOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { GLAccount } from '../../types/glAccount';

const { Title, Text } = Typography;

interface GLAccountStatsProps {
  accounts: GLAccount[];
}

export const GLAccountStats: React.FC<GLAccountStatsProps> = ({ accounts }) => {
  const stats = useMemo(() => {
    const totalAccounts = accounts.length;
    const accountsWithLineItems = accounts.filter(acc => 
      acc._count && acc._count.lineItems > 0
    ).length;

    return {
      totalAccounts,
      accountsWithLineItems,
    };
  }, [accounts]);

  if (accounts.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <BankOutlined className="text-4xl text-gray-400 mb-4" />
          <Title level={4} className="text-gray-500">No GL Accounts Found</Title>
          <Text type="secondary">Create some GL accounts to see statistics here.</Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="gl-account-stats">
      {/* Overview Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Accounts"
              value={stats.totalAccounts}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
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

      {/* Account Usage Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Account Usage Statistics" extra={<BarChartOutlined />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileOutlined className="text-green-500" />
                  <Text>Accounts with Line Items</Text>
                </div>
                <div className="flex items-center gap-2">
                  <Text strong>{stats.accountsWithLineItems}</Text>
                  <Text type="secondary">
                    ({stats.totalAccounts > 0 ? Math.round((stats.accountsWithLineItems / stats.totalAccounts) * 100) : 0}%)
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Summary */}
      <Card title="Summary">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div className="space-y-2">
              <Text strong>Account Usage:</Text>
              <div className="pl-4 space-y-1">
                <Text type="secondary">
                  • {stats.accountsWithLineItems} accounts are used in transactions
                </Text>
                <Text type="secondary">
                  • {stats.totalAccounts - stats.accountsWithLineItems} accounts are unused
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}; 