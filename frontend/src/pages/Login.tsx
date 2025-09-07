import React, { useState } from 'react';
import { LoginForm, ProFormText } from '@ant-design/pro-form';
import { ProConfigProvider } from '@ant-design/pro-components';
import { UserOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { message, Tabs, Card, Select, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, USER_ROLES } from '@/hooks/useAuth';
import type { LoginRequest, RegisterRequest } from '@/types';
import './Login.css';

const { TabPane } = Tabs;
const { Option } = Select;

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/';

  // 处理登录
  const handleLogin = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const result = await login(values);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (values: RegisterRequest) => {
    setLoading(true);
    try {
      const result = await register(values);
      if (result.success) {
        setActiveTab('login');
        message.success('注册成功，请登录');
      }
    } catch (error) {
      console.error('注册失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background" />
      <div className="login-content">
        <Card className="login-card" bordered={false}>
          <div className="login-header">
            <div className="logo">
              <BookOutlined />
            </div>
            <h1>图书管理系统</h1>
            <p>Library Management System</p>
          </div>

          <ProConfigProvider hashed={false}>
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as 'login' | 'register')}
              centered
              size="large"
            >
              <TabPane tab="登录" key="login">
                <LoginForm<LoginRequest>
                  logo={false}
                  title={false}
                  subTitle={false}
                  onFinish={handleLogin}
                  loading={loading}
                  submitter={{
                    searchConfig: {
                      submitText: '登录',
                    },
                    render: (_, dom) => dom.pop(),
                    submitButtonProps: {
                      loading,
                      size: 'large',
                      style: {
                        width: '100%',
                      },
                    },
                  }}
                >
                  <ProFormText
                    name="username"
                    fieldProps={{
                      size: 'large',
                      prefix: <UserOutlined />,
                      placeholder: '用户名',
                    }}
                    rules={[
                      {
                        required: true,
                        message: '请输入用户名！',
                      },
                    ]}
                  />
                  <ProFormText.Password
                    name="password"
                    fieldProps={{
                      size: 'large',
                      prefix: <LockOutlined />,
                      placeholder: '密码',
                    }}
                    rules={[
                      {
                        required: true,
                        message: '请输入密码！',
                      },
                    ]}
                  />

                  <div className="login-demo-info">
                    <p>演示账号：</p>
                    <p>管理员：admin / admin123</p>
                    <p>老师：teacher / teacher123</p>
                    <p>学生：student / student123</p>
                  </div>
                </LoginForm>
              </TabPane>

              <TabPane tab="注册" key="register">
                <LoginForm<RegisterRequest>
                  logo={false}
                  title={false}
                  subTitle={false}
                  onFinish={handleRegister}
                  loading={loading}
                  submitter={{
                    searchConfig: {
                      submitText: '注册',
                    },
                    render: (_, dom) => dom.pop(),
                    submitButtonProps: {
                      loading,
                      size: 'large',
                      style: {
                        width: '100%',
                      },
                    },
                  }}
                >
                  <ProFormText
                    name="username"
                    fieldProps={{
                      size: 'large',
                      prefix: <UserOutlined />,
                      placeholder: '用户名',
                    }}
                    rules={[
                      { required: true, message: '请输入用户名' },
                      { min: 3, message: '用户名至少3个字符' },
                      { max: 20, message: '用户名最多20个字符' },
                    ]}
                  />

                  <ProFormText
                    name="realName"
                    fieldProps={{
                      size: 'large',
                      prefix: <UserOutlined />,
                      placeholder: '真实姓名',
                    }}
                    rules={[
                      { required: true, message: '请输入真实姓名' },
                      { max: 50, message: '姓名最多50个字符' },
                    ]}
                  />

                  <ProFormText.Password
                    name="password"
                    fieldProps={{
                      size: 'large',
                      prefix: <LockOutlined />,
                      placeholder: '密码',
                    }}
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, message: '密码至少6个字符' },
                    ]}
                  />

                  <ProFormText.Password
                    name="confirmPassword"
                    fieldProps={{
                      size: 'large',
                      prefix: <LockOutlined />,
                      placeholder: '确认密码',
                    }}
                    dependencies={['password']}
                    rules={[
                      { required: true, message: '请确认密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('两次输入的密码不一致'));
                        },
                      }),
                    ]}
                  />

                  <ProFormText
                    name="email"
                    fieldProps={{
                      size: 'large',
                      placeholder: '邮箱（可选）',
                    }}
                    rules={[
                      { type: 'email', message: '请输入有效的邮箱地址' },
                      { max: 100, message: '邮箱地址最多100个字符' },
                    ]}
                  />

                  <ProFormText
                    name="phone"
                    fieldProps={{
                      size: 'large',
                      placeholder: '手机号（可选）',
                    }}
                    rules={[
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
                    ]}
                  />

                  <div className="role-selection">
                    <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span>选择角色：</span>
                      <Select 
                        placeholder="请选择角色"
                        style={{ width: 200 }}
                        defaultValue={USER_ROLES.STUDENT.code}
                        size="large"
                      >
                        <Option value={USER_ROLES.STUDENT.code}>学生</Option>
                        <Option value={USER_ROLES.TEACHER.code}>老师</Option>
                      </Select>
                    </Space>
                  </div>
                </LoginForm>
              </TabPane>
            </Tabs>
          </ProConfigProvider>
        </Card>
      </div>
    </div>
  );
};

export default Login;