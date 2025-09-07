import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Tag, Card, message, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { userAPI } from '../../services/api';
import type { User } from '../../types';
import { UserRole } from '../../types';
import dayjs from 'dayjs';

const { Search } = Input;

const UserManage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  const fetchUsers = async (page = 1, size = 10, search = '') => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers({ page, size, keyword: search });
      setUsers(response.data.records);
      setTotal(response.data.total);
      setCurrent(page);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1);
    fetchUsers(1, pageSize, value);
  };

  const handleStatusChange = async (userId: number, checked: boolean) => {
    try {
      await userAPI.updateUserStatus(userId, checked ? 1 : 0);
      message.success('状态更新成功');
      fetchUsers(current, pageSize, keyword);
    } catch (error) {
      console.error('状态更新失败:', error);
    }
  };

  const getRoleTag = (role: UserRole) => {
    const roleMap = {
      [UserRole.STUDENT]: { color: 'blue', text: '学生' },
      [UserRole.TEACHER]: { color: 'green', text: '老师' },
      [UserRole.ADMIN]: { color: 'red', text: '管理员' },
    };
    const config = roleMap[role];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '学号/工号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => getRoleTag(role),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record: User) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const handleTableChange = (pagination: any) => {
    fetchUsers(pagination.current, pagination.pageSize, keyword);
  };

  return (
    <Card title="用户管理">
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索用户名、真实姓名、邮箱"
          allowClear
          style={{ width: 300 }}
          onSearch={handleSearch}
        />
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default UserManage;