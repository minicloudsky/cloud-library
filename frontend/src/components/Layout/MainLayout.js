import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Badge, Drawer } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  ReadOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  BellOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isTeacherOrAdmin } = useAuth();

  // 菜单项配置
  const getMenuItems = () => {
    const items = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: '首页'
      },
      {
        key: '/books',
        icon: <BookOutlined />,
        label: '图书管理',
        children: [
          {
            key: '/books/browse',
            label: '浏览图书'
          },
          ...(isTeacherOrAdmin() ? [
            {
              key: '/books/manage',
              label: '管理图书'
            }
          ] : [])
        ]
      },
      {
        key: '/borrow',
        icon: <ReadOutlined />,
        label: '借阅管理',
        children: [
          {
            key: '/borrow/my-records',
            label: '我的借阅'
          },
          ...(isTeacherOrAdmin() ? [
            {
              key: '/borrow/all-records',
              label: '所有借阅记录'
            }
          ] : [])
        ]
      },
      ...(isTeacherOrAdmin() ? [
        {
          key: '/users',
          icon: <UserOutlined />,
          label: '用户管理'
        }
      ] : [])
    ];

    return items;
  };

  // 处理菜单点击
  const handleMenuClick = (e) => {
    navigate(e.key);
    setMobileMenuVisible(false);
  };

  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true
    }
  ];

  // 处理用户菜单点击
  const handleUserMenuClick = (e) => {
    if (e.key === 'logout') {
      logout();
      navigate('/login');
    } else if (e.key === 'profile') {
      navigate('/profile');
    } else if (e.key === 'settings') {
      navigate('/settings');
    }
  };

  // 获取用户角色显示文本
  const getRoleText = (role) => {
    switch (role?.code) {
      case 1:
        return '学生';
      case 2:
        return '老师';
      case 3:
        return '管理员';
      default:
        return '未知';
    }
  };

  // 侧边栏内容
  const sidebarContent = (
    <div className="sidebar-content">
      <div className="sidebar-logo">
        <BookOutlined className="logo-icon" />
        {!collapsed && <span className="logo-text">图书管理系统</span>}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={getMenuItems()}
        onClick={handleMenuClick}
        className="main-menu"
      />
    </div>
  );

  return (
    <Layout className="main-layout">
      {/* 桌面端侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="main-sider desktop-sider"
        width={240}
        collapsedWidth={80}
      >
        {sidebarContent}
      </Sider>

      {/* 移动端侧边栏 */}
      <Drawer
        title="菜单"
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        className="mobile-drawer"
        width={240}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={handleMenuClick}
          className="mobile-menu"
        />
      </Drawer>

      <Layout className="main-content-layout">
        {/* 顶部导航 */}
        <Header className="main-header">
          <div className="header-left">
            {/* 桌面端折叠按钮 */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn desktop-only"
            />
            
            {/* 移动端菜单按钮 */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
              className="mobile-menu-btn mobile-only"
            />
            
            <span className="page-title">
              {getMenuItems().find(item => 
                item.key === location.pathname || 
                item.children?.find(child => child.key === location.pathname)
              )?.label || '首页'}
            </span>
          </div>

          <div className="header-right">
            {/* 通知铃铛 */}
            <Badge count={0} className="notification-badge">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="notification-btn"
              />
            </Badge>

            {/* 用户信息 */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick
              }}
              placement="bottomRight"
            >
              <div className="user-info">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  className="user-avatar"
                />
                <div className="user-details desktop-only">
                  <div className="user-name">{user?.realName || user?.username}</div>
                  <div className="user-role">{getRoleText(user?.role)}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 主要内容区域 */}
        <Content className="main-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;