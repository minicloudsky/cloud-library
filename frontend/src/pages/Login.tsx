import React from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { setToken, setUser, clearUserData } from '../utils/auth';
import type { LoginRequest } from '../types';
import './Login.css';

const { Title } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      // 清除旧的用户数据
      clearUserData();
      
      const response = await authAPI.login(values);
      const { token } = response.data;
      
      setToken(token);
      
      // 获取完整用户信息并保存
      const userResponse = await authAPI.getCurrentUser();
      console.log('User data from API:', userResponse.data);
      setUser(userResponse.data);
      
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Title level={2}>图书管理系统</Title>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        
        <div className="login-footer">
          <p>默认账号: admin / admin (管理员)</p>
          <p>teacher01 / admin (老师)</p>
          <p>student01 / admin (学生)</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;