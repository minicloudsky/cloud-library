import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Tag, Card, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { borrowAPI } from '../../services/api';
import type { BorrowRecord } from '../../types';
import { BorrowStatus } from '../../types';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const AllBorrowRecords: React.FC = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');

  const fetchRecords = async (page = 1, size = 10, search = '', statusFilter = '') => {
    setLoading(true);
    try {
      const response = await borrowAPI.getBorrowRecords({ 
        page, 
        size, 
        keyword: search, 
        status: statusFilter 
      });
      setRecords(response.data.records);
      setTotal(response.data.total);
      setCurrent(page);
    } catch (error) {
      console.error('获取借阅记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1);
    fetchRecords(1, pageSize, value, status);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrent(1);
    fetchRecords(1, pageSize, keyword, value);
  };

  const getStatusTag = (status: BorrowStatus) => {
    const statusMap = {
      [BorrowStatus.BORROWED]: { color: 'blue', text: '已借阅' },
      [BorrowStatus.RETURNED]: { color: 'green', text: '已归还' },
      [BorrowStatus.OVERDUE]: { color: 'red', text: '已逾期' },
      [BorrowStatus.LOST]: { color: 'red', text: '已丢失' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<BorrowRecord> = [
    {
      title: '用户',
      key: 'userName',
      render: (_, record) => record.user?.realName || record.user?.username || '-',
    },
    {
      title: '书名',
      key: 'bookTitle',
      render: (_, record) => record.book?.title || '-',
    },
    {
      title: '作者',
      key: 'bookAuthor',
      render: (_, record) => record.book?.author || '-',
    },
    {
      title: '借阅日期',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '应还日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '实际还书日期',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: BorrowStatus) => getStatusTag(status),
    },
    {
      title: '罚金',
      dataIndex: 'fineAmount',
      key: 'fineAmount',
      render: (amount: number) => amount > 0 ? `¥${amount}` : '-',
    },
  ];

  const handleTableChange = (pagination: any) => {
    fetchRecords(pagination.current, pagination.pageSize, keyword, status);
  };

  return (
    <Card title="所有借阅记录">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="搜索用户或书名"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          <Select
            placeholder="选择状态"
            style={{ width: 120 }}
            allowClear
            onChange={handleStatusChange}
          >
            <Option value="BORROWED">已借阅</Option>
            <Option value="RETURNED">已归还</Option>
            <Option value="OVERDUE">已逾期</Option>
            <Option value="LOST">已丢失</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={records}
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

export default AllBorrowRecords;