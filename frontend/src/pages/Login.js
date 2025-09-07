import React, { useState } from 'react';
import { Form, Input, Button, Card, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth, USER_ROLES } from '../hooks/useAuth';
import './Login.css';

const { TabPane } = Tabs;

const Login = () => {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // 处理登录
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const result = await login(values);
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const result = await register(values);
      if (result.success) {
        setActiveTab('login');
        registerForm.resetFields();
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
      <Card className="login-card" title={null} bordered={false}>
        <div className="login-header">
          <h1>📚 图书管理系统</h1>
          <p>Library Management System</p>
        </div>
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          className="login-tabs"
        >
          <TabPane tab="登录" key="login">
            <Form
              form={loginForm}
              onFinish={handleLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名"
                  autoComplete="username"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                  autoComplete="current-password"
                />
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
            
            <div className="login-demo-info">
              <p>演示账号：</p>
              <p>管理员：admin / admin123</p>
            </div>
          </TabPane>
          
          <TabPane tab="注册" key="register">
            <Form
              form={registerForm}
              onFinish={handleRegister}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { max: 20, message: '用户名最多20个字符' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名"
                  autoComplete="username"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                  autoComplete="new-password"
                />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
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
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="确认密码"
                  autoComplete="new-password"
                />
              </Form.Item>
              
              <Form.Item
                name="realName"
                rules={[
                  { required: true, message: '请输入真实姓名' },
                  { max: 50, message: '姓名最多50个字符' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="真实姓名"
                  autoComplete="name"
                />
              </Form.Item>
              
              <Form.Item
                name="email"
                rules={[
                  { type: 'email', message: '请输入有效的邮箱地址' },
                  { max: 100, message: '邮箱地址最多100个字符' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="邮箱（可选）"
                  autoComplete="email"
                />
              </Form.Item>
              
              <Form.Item
                name="phone"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="手机号（可选）"
                  autoComplete="tel"
                />
              </Form.Item>
              
              <Form.Item
                name="role"
                rules={[{ required: true, message: '请选择用户角色' }]}
                initialValue={USER_ROLES.STUDENT.code}
              >
                <div className="role-selection">
                  <label>选择角色：</label>
                  <div className="role-buttons">
                    <Button
                      type={registerForm.getFieldValue('role') === USER_ROLES.STUDENT.code ? 'primary' : 'default'}
                      onClick={() => registerForm.setFieldsValue({ role: USER_ROLES.STUDENT.code })}
                    >
                      学生
                    </Button>
                    <Button
                      type={registerForm.getFieldValue('role') === USER_ROLES.TEACHER.code ? 'primary' : 'default'}
                      onClick={() => registerForm.setFieldsValue({ role: USER_ROLES.TEACHER.code })}
                    >
                      老师
                    </Button>
                  </div>
                </div>
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;