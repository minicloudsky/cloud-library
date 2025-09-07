import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Button } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  HistoryOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout } from '../../utils/auth';
import { UserRole } from '../../types';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  
  // 调试用户信息
  console.log('Current user in MainLayout:', user);
  console.log('User realName:', user?.realName);

  const menuItems = [
    {
      key: '/books',
      icon: <BookOutlined />,
      label: '图书管理',
    },
    {
      key: '/borrow',
      icon: <HistoryOutlined />,
      label: '借阅记录',
      children: [
        {
          key: '/borrow/my-records',
          label: '我的借阅',
        },
        ...(user?.role !== UserRole.STUDENT ? [{
          key: '/borrow/all-records',
          label: '所有借阅',
        }] : []),
      ],
    },
    ...(user?.role === UserRole.ADMIN ? [{
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    }] : []),
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  return (
    <Layout className="main-layout">
      <Header className="layout-header">
        <div className="header-left">
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            图书管理系统
          </Title>
        </div>
        <div className="header-right">
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="user-info">
              <Avatar icon={<UserOutlined />} />
              <span className="username">
                {user?.realName && user.realName !== 'null' ? user.realName : user?.username}
              </span>
            </div>
          </Dropdown>
        </div>
      </Header>
      
      <Layout>
        <Sider width={200} className="layout-sider">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        
        <Layout className="layout-content-wrapper">
          <Content className="layout-content">
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;