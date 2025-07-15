import React, { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Button,
  Space,
  Avatar,
  Dropdown,
  Badge,
  Divider,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  BankOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  breadcrumb?: Array<{ title: string; path?: string }>;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  breadcrumb,
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items for sidebar
  const menuItems = [
    {
      key: "/purchase-orders",
      icon: <FileTextOutlined />,
      label: "Purchase Orders",
      children: [
        {
          key: "/purchase-orders",
          label: "All Orders",
        },
        {
          key: "/purchase-orders/new",
          label: "Create New",
        },
      ],
    },
    {
      key: "/gl-accounts",
      icon: <BankOutlined />,
      label: "GL Accounts",
    },
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  // User dropdown menu
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      // Handle logout
      console.log("Logout clicked");
    } else {
      navigate(key);
    }
  };

  const handleSidebarMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          background: "#001529",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <BankOutlined
            style={{
              fontSize: collapsed ? 24 : 28,
              color: "#1890ff",
              marginRight: collapsed ? 0 : 12,
            }}
          />
          {!collapsed && (
            <Title
              level={4}
              style={{
                color: "#fff",
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              PO Manager
            </Title>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleSidebarMenuClick}
          style={{
            borderRight: "none",
            background: "transparent",
          }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          {/* Left side - Toggle button and breadcrumb */}
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 40,
                height: 40,
              }}
            />
            <Divider type="vertical" />
            {breadcrumb && (
              <Space>
                {breadcrumb.map((item, index) => (
                  <Text
                    key={index}
                    style={{
                      color:
                        index === breadcrumb.length - 1 ? "#1890ff" : "#666",
                      cursor: item.path ? "pointer" : "default",
                    }}
                    onClick={() => item.path && navigate(item.path)}
                  >
                    {item.title}
                  </Text>
                ))}
              </Space>
            )}
          </Space>
        </Header>

        {/* Main Content */}
        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#f5f5f5",
            borderRadius: 8,
            minHeight: "calc(100vh - 112px)",
          }}
        >
          {/* Page Header */}
          {(pageTitle || pageSubtitle) && (
            <div
              style={{
                marginBottom: 24,
                padding: "24px",
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {pageTitle && (
                <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                  {pageTitle}
                </Title>
              )}
              {pageSubtitle && (
                <Text type="secondary" style={{ fontSize: 16 }}>
                  {pageSubtitle}
                </Text>
              )}
            </div>
          )}

          {/* Page Content */}
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
