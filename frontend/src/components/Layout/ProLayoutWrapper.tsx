import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-layout';
import { Avatar, Dropdown, Space, Badge } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  ReadOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  HomeOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import type { MenuDataItem } from '@ant-design/pro-layout';

const ProLayoutWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isTeacherOrAdmin } = useAuth();
  const [pathname, setPathname] = useState(location.pathname);

  // 菜单配置
  const menuData: MenuDataItem[] = [
    {
      path: '/',
      name: '首页',
      icon: <HomeOutlined />,
    },
    {
      path: '/books',
      name: '图书管理',
      icon: <BookOutlined />,
      children: [
        {
          path: '/books/browse',
          name: '浏览图书',
        },
        ...(isTeacherOrAdmin() ? [
          {
            path: '/books/manage',
            name: '管理图书',
          }
        ] : []),
      ],
    },
    {
      path: '/borrow',
      name: '借阅管理',
      icon: <ReadOutlined />,
      children: [
        {
          path: '/borrow/my-records',
          name: '我的借阅',
        },
        ...(isTeacherOrAdmin() ? [
          {
            path: '/borrow/all-records',
            name: '所有借阅记录',
          }
        ] : []),
      ],
    },
    ...(isTeacherOrAdmin() ? [
      {
        path: '/users',
        name: '用户管理',
        icon: <UserOutlined />,
      }
    ] : []),
  ];

  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  // 获取用户角色显示文本
  const getRoleText = (roleCode?: number): string => {
    switch (roleCode) {
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

  // 获取角色图标
  const getRoleIcon = (roleCode?: number) => {
    switch (roleCode) {
      case 1:
        return <UserOutlined />;
      case 2:
        return <BookOutlined />;
      case 3:
        return <CrownOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  return (
    <ProLayout
      title="图书管理系统"
      logo={<BookOutlined style={{ color: '#1890ff' }} />}
      location={{ pathname }}
      route={{
        path: '/',
        routes: menuData,
      }}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            setPathname(item.path || '/');
            navigate(item.path || '/');
          }}
        >
          {dom}
        </div>
      )}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: '首页',
        },
        ...routers,
      ]}
      itemRender={(route) => {
        return route.breadcrumbName;
      }}
      avatarProps={{
        src: undefined,
        size: 'small',
        title: user?.realName || user?.username,
        render: (props, defaultDom) => {
          return (
            <Dropdown
              menu={{
                items: userMenuItems,
              }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer', padding: '0 8px' }}>
                <Avatar 
                  size="small" 
                  icon={getRoleIcon(user?.role?.code)}
                  style={{ backgroundColor: '#1890ff' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {user?.realName || user?.username}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {getRoleText(user?.role?.code)}
                  </div>
                </div>
              </Space>
            </Dropdown>
          );
        },
      }}
      actionsRender={() => [
        <Badge count={0} key="notification">
          <BellOutlined
            style={{
              fontSize: 16,
              cursor: 'pointer',
            }}
          />
        </Badge>,
      ]}
      headerTitleRender={(logo, title) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => {
            setPathname('/');
            navigate('/');
          }}
        >
          {logo}
          <span style={{ marginLeft: 8, fontWeight: 'bold' }}>{title}</span>
        </div>
      )}
      menuFooterRender={() => (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#999' }}>
          <div style={{ fontSize: '12px' }}>Powered by</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Pro Components</div>
        </div>
      )}
      onMenuHeaderClick={() => {
        setPathname('/');
        navigate('/');
      }}
      menuProps={{
        selectedKeys: [pathname],
      }}
      layout="mix"
      navTheme="light"
      primaryColor="#1890ff"
      contentWidth="Fluid"
      fixSiderbar
      fixedHeader
      colorWeak={false}
    >
      <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Outlet />
      </div>
    </ProLayout>
  );
};

export default ProLayoutWrapper;