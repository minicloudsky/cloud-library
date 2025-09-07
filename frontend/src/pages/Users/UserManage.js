import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Select, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Tag,
  Typography,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Avatar,
  Descriptions,
  Switch
} from 'antd';
import { 
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  EyeOutlined,
  ExportOutlined,
  TeamOutlined,
  CrownOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { userAPI } from '../../services/api';
import { USER_ROLES } from '../../hooks/useAuth';
import dayjs from 'dayjs';
import './UserManage.css';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const UserManage = () => {
  const { isTeacherOrAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    keyword: '',
    role: '',
    status: '',
  });
  
  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('add'); // add, edit, view
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  
  const [statistics, setStatistics] = useState({
    total: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    if (isTeacherOrAdmin()) {
      fetchUsers();
    }
  }, [pagination.current, pagination.pageSize, isTeacherOrAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        current: pagination.current,
        size: pagination.pageSize,
        ...filters,
      };
      
      const response = await userAPI.getUserList(params);
      const { records, total } = response.data;
      
      setUsers(records || []);
      setPagination(prev => ({
        ...prev,
        total,
      }));

      // 计算统计数据
      const stats = (records || []).reduce((acc, user) => {
        acc.total += 1;
        
        // 按角色统计
        switch (user.role?.code) {
          case USER_ROLES.STUDENT.code:
            acc.students += 1;
            break;
          case USER_ROLES.TEACHER.code:
            acc.teachers += 1;
            break;
          case USER_ROLES.ADMIN.code:
            acc.admins += 1;
            break;
        }
        
        // 按状态统计
        if (user.status) {
          acc.active += 1;
        } else {
          acc.inactive += 1;
        }
        
        return acc;
      }, { total: 0, students: 0, teachers: 0, admins: 0, active: 0, inactive: 0 });

      setStatistics(stats);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(fetchUsers, 100);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(fetchUsers, 100);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  // 添加用户
  const handleAddUser = () => {
    setModalType('add');
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 查看用户详情
  const handleViewUser = (user) => {
    setModalType('view');
    setEditingUser(user);
    setModalVisible(true);
  };

  // 编辑用户
  const handleEditUser = (user) => {
    setModalType('edit');
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      role: user.role?.code,
    });
    setModalVisible(true);
  };

  // 删除用户
  const handleDeleteUser = async (userId) => {
    try {
      await userAPI.deleteUser(userId);
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      console.error('删除失败:', error);
      message.error(error.message || '删除失败');
    }
  };

  // 修改用户状态
  const handleChangeStatus = async (userId, status) => {
    try {
      await userAPI.changeUserStatus(userId, status);
      message.success('状态更新成功');
      fetchUsers();
    } catch (error) {
      console.error('状态更新失败:', error);
      message.error(error.message || '状态更新失败');
    }
  };

  // 保存用户
  const handleSave = async (values) => {
    try {
      const data = {
        ...values,
        status: values.status ?? true,
      };

      if (modalType === 'add') {
        await userAPI.register(data);
        message.success('添加用户成功');
      } else {
        await userAPI.updateUser(editingUser.id, data);
        message.success('更新用户成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('保存失败:', error);
      message.error(error.message || '保存失败');
    }
  };

  const getRoleTag = (role) => {
    switch (role?.code) {
      case USER_ROLES.STUDENT.code:
        return <Tag color="blue" icon={<UserOutlined />}>学生</Tag>;
      case USER_ROLES.TEACHER.code:
        return <Tag color="green" icon={<BookOutlined />}>老师</Tag>;
      case USER_ROLES.ADMIN.code:
        return <Tag color="red" icon={<CrownOutlined />}>管理员</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  };

  const getStatusTag = (status) => {
    return status ? 
      <Tag color="green">正常</Tag> : 
      <Tag color="red">禁用</Tag>;
  };

  const columns = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 200,
      render: (_, record) => (
        <div className="user-info">
          <div className="user-basic">
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              style={{ marginRight: 8 }}
            />
            <div>
              <div className="user-name">{record.realName || record.username}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                用户名: {record.username}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div className="contact-info">
          {record.email && <div>{record.email}</div>}
          {record.phone && <Text type="secondary">{record.phone}</Text>}
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => getRoleTag(role),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.status}
          onChange={(checked) => handleChangeStatus(record.id, checked)}
          checkedChildren="正常"
          unCheckedChildren="禁用"
          size="small"
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120,
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD') : '-',
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 120,
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewUser(record)}
            size="small"
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除这个用户？"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isTeacherOrAdmin()) {
    return (
      <div className="access-denied">
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <UserOutlined style={{ fontSize: '48px', color: '#faad14' }} />
            <Title level={3}>权限不足</Title>
            <Text type="secondary">仅老师和管理员可管理用户</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="user-manage-container">
      <Card className="header-card">
        <Title level={3}>👥 用户管理</Title>
        <Text type="secondary">管理系统用户信息和权限</Text>
      </Card>

      {/* 统计信息 */}
      <Card className="statistics-card">
        <Row gutter={16}>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="总用户"
              value={statistics.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="学生"
              value={statistics.students}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="老师"
              value={statistics.teachers}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="管理员"
              value={statistics.admins}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="正常"
              value={statistics.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="禁用"
              value={statistics.inactive}
              valueStyle={{ color: '#f5222d' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 操作栏 */}
      <Card className="toolbar-card">
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} lg={12}>
            <Space wrap>
              <Search
                placeholder="搜索用户名、姓名、邮箱..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              <Select
                placeholder="角色"
                allowClear
                style={{ width: 100 }}
                onChange={(value) => handleFilterChange('role', value)}
              >
                <Option value={USER_ROLES.STUDENT.code}>学生</Option>
                <Option value={USER_ROLES.TEACHER.code}>老师</Option>
                <Option value={USER_ROLES.ADMIN.code}>管理员</Option>
              </Select>
              <Select
                placeholder="状态"
                allowClear
                style={{ width: 100 }}
                onChange={(value) => handleFilterChange('status', value)}
              >
                <Option value="true">正常</Option>
                <Option value="false">禁用</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} lg={12} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddUser}
              >
                添加用户
              </Button>
              <Button icon={<ExportOutlined />}>
                导出数据
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 用户列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 用户弹窗 */}
      <Modal
        title={
          modalType === 'add' ? '添加用户' : 
          modalType === 'edit' ? '编辑用户' : '用户详情'
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={modalType === 'view' ? null : undefined}
        width={600}
        destroyOnClose
      >
        {modalType === 'view' && editingUser ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="用户名">
              {editingUser.username}
            </Descriptions.Item>
            <Descriptions.Item label="真实姓名">
              {editingUser.realName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              {editingUser.email || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="手机">
              {editingUser.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="角色">
              {getRoleTag(editingUser.role)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {getStatusTag(editingUser.status)}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {editingUser.createTime ? 
                dayjs(editingUser.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="最后登录">
              {editingUser.lastLoginTime ? 
                dayjs(editingUser.lastLoginTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              role: USER_ROLES.STUDENT.code,
              status: true,
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[
                    { required: true, message: '请输入用户名' },
                    { min: 3, message: '用户名至少3个字符' },
                    { max: 20, message: '用户名最多20个字符' }
                  ]}
                >
                  <Input placeholder="请输入用户名" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="realName"
                  label="真实姓名"
                  rules={[
                    { required: true, message: '请输入真实姓名' },
                    { max: 50, message: '姓名最多50个字符' }
                  ]}
                >
                  <Input placeholder="请输入真实姓名" />
                </Form.Item>
              </Col>
            </Row>

            {modalType === 'add' && (
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="password"
                    label="密码"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, message: '密码至少6个字符' }
                    ]}
                  >
                    <Input.Password placeholder="请输入密码" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="确认密码"
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
                    <Input.Password placeholder="请确认密码" />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { type: 'email', message: '请输入有效的邮箱地址' },
                    { max: 100, message: '邮箱地址最多100个字符' }
                  ]}
                >
                  <Input placeholder="请输入邮箱" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="手机号"
                  rules={[
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                  ]}
                >
                  <Input placeholder="请输入手机号" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="role"
                  label="角色"
                  rules={[{ required: true, message: '请选择角色' }]}
                >
                  <Select placeholder="请选择角色">
                    <Option value={USER_ROLES.STUDENT.code}>学生</Option>
                    <Option value={USER_ROLES.TEACHER.code}>老师</Option>
                    <Option value={USER_ROLES.ADMIN.code}>管理员</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label="状态"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="正常" 
                    unCheckedChildren="禁用" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {modalType === 'add' ? '添加' : '更新'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default UserManage;