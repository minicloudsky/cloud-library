import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Card, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { borrowAPI } from '../../services/api';
import type { BorrowRecord } from '../../types';
import { BorrowStatus } from '../../types';
import dayjs from 'dayjs';

const MyBorrowRecords: React.FC = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchRecords = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const response = await borrowAPI.getMyBorrowRecords({ page, size });
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

  const handleReturn = async (recordId: number) => {
    try {
      await borrowAPI.returnBook(recordId);
      message.success('还书成功');
      fetchRecords(current, pageSize);
    } catch (error) {
      console.error('还书失败:', error);
    }
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
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        record.status === BorrowStatus.BORROWED && (
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleReturn(record.id)}
          >
            还书
          </Button>
        )
      ),
    },
  ];

  const handleTableChange = (pagination: any) => {
    fetchRecords(pagination.current, pagination.pageSize);
  };

  return (
    <Card title="我的借阅记录">
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

export default MyBorrowRecords;