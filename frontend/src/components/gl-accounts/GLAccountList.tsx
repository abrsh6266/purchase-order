import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SelectOutlined,
  BankOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { GLAccount, QueryGLAccountDto } from "../../types/glAccount";

const { Search } = Input;
const { Text } = Typography;

interface GLAccountListProps {
  accounts: GLAccount[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: QueryGLAccountDto;
  onEdit: (account: GLAccount) => void;
  onView: (account: GLAccount) => void;
  onDelete: (account: GLAccount) => void;
  onSelect?: (account: GLAccount) => void;
  onFiltersChange: (filters: Partial<QueryGLAccountDto>) => void;
  onRefresh: () => void;
  showActions?: boolean;
}

export const GLAccountList: React.FC<GLAccountListProps> = ({
  accounts,
  loading,
  pagination,
  filters,
  onEdit,
  onDelete,
  onSelect,
  onFiltersChange,
  onRefresh,
  showActions = true,
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(
    filters.search || ""
  );
  const previousFiltersRef = useRef<QueryGLAccountDto>(filters);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Update filters when debounced search value changes - only if it's different
  useEffect(() => {
    const newSearchValue = debouncedSearchValue || undefined;
    if (previousFiltersRef.current.search !== newSearchValue) {
      onFiltersChange({ search: newSearchValue, page: 1 });
      previousFiltersRef.current = {
        ...previousFiltersRef.current,
        search: newSearchValue,
      };
    }
  }, [debouncedSearchValue, onFiltersChange]);

  // Update local search value when filters change externally
  useEffect(() => {
    if (filters.search !== searchValue) {
      setSearchValue(filters.search || "");
      setDebouncedSearchValue(filters.search || "");
    }
  }, [filters.search]);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleTableChange = useCallback(
    (pagination: any, _filters: any, sorter: any) => {
      const newFilters: Partial<QueryGLAccountDto> = {};

      if (pagination) {
        newFilters.page = pagination.current;
        newFilters.limit = pagination.pageSize;
      }

      // Handle sorting
      if (sorter && sorter.field) {
        newFilters.sortBy = sorter.field;
        newFilters.sortOrder = sorter.order === "descend" ? "desc" : "asc";
      }

      // Call the parent's filter change handler
      onFiltersChange(newFilters);
    },
    [onFiltersChange]
  );

  const columns = [
    {
      title: "Account Code",
      dataIndex: "accountCode",
      key: "accountCode",
      sorter: true,
      render: (code: string) => (
        <div className="flex items-center gap-2">
          <BankOutlined className="text-blue-500" />
          <Text strong>{code}</Text>
        </div>
      ),
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
      sorter: true,
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-gray-400" />
          <Text>{name}</Text>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: true,
      render: (description: string) => (
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-gray-400" />
          <Text>{description}</Text>
        </div>
      ),
    },
    {
      title: "Usage",
      key: "usage",
      render: (record: GLAccount) => (
        <div className="flex gap-2">
          {record._count && (
            <>
              <Tooltip title="Line Items">
                <Tag color="purple">{record._count.lineItems}</Tag>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
    ...(showActions || onSelect
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (record: GLAccount) => (
              <Space size="small">
                {showActions && (
                  <>
                    <Tooltip title="Edit Account">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                      />
                    </Tooltip>
                    <Tooltip title="Delete Account">
                      <Popconfirm
                        title="Delete Account"
                        description={`Are you sure you want to delete "${record.accountName}"? This action cannot be undone.`}
                        onConfirm={() => onDelete(record)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          disabled={
                            record._count && record._count.lineItems > 0
                          }
                        />
                      </Popconfirm>
                    </Tooltip>
                  </>
                )}
                {onSelect && (
                  <Tooltip title="Select Account">
                    <Button
                      type="primary"
                      size="small"
                      icon={<SelectOutlined />}
                      onClick={() => onSelect(record)}
                    >
                      Select
                    </Button>
                  </Tooltip>
                )}
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="gl-account-list">
      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search accounts..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={accounts}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} accounts`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
        size="middle"
      />
    </div>
  );
};
