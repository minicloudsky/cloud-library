import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Select, 
  Button, 
  Tag, 
  Space, 
  DatePicker, 
  Typography,
  message,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Popconfirm
} from 'antd';
import { 
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  UndoOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { borrowAPI } from '../../services/api';
import dayjs from 'dayjs';
import './AllBorrowRecords.css';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const AllBorrowRecords = () => {
  const { isTeacherOrAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    dateRange: null,
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    borrowed: 0,
    returned: 0,
    overdue: 0
  });

  useEffect(() => {
    if (isTeacherOrAdmin()) {
      fetchRecords();
    }
  }, [pagination.current, pagination.pageSize, isTeacherOrAdmin]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {
        current: pagination.current,
        size: pagination.pageSize,
        ...filters,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
      };
      
      const response = await borrowAPI.getBorrowRecords(params);
      const { records: recordList, total } = response.data;
      
      setRecords(recordList || []);
      setPagination(prev => ({
        ...prev,
        total,
      }));

      // 计算统计数据
      const stats = (recordList || []).reduce((acc, record) => {
        acc.total += 1;
        switch (record.status) {
          case 'BORROWED':
            acc.borrowed += 1;
            break;
          case 'RETURNED':
            acc.returned += 1;
            break;
          case 'OVERDUE':
            acc.overdue += 1;
            break;
        }
        return acc;
      }, { total: 0, borrowed: 0, returned: 0, overdue: 0 });

      setStatistics(stats);
    } catch (error) {
      console.error('获取借阅记录失败:', error);
      message.error('获取借阅记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(fetchRecords, 100);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(fetchRecords, 100);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleReturnBook = async (recordId) => {
    setReturnLoading(true);
    try {
      await borrowAPI.returnBook(recordId);
      message.success('归还成功！');
      fetchRecords();
      setDetailModalVisible(false);
    } catch (error) {
      console.error('归还失败:', error);
      message.error(error.message || '归还失败');
    } finally {
      setReturnLoading(false);
    }
  };

  const getBorrowStatusTag = (status, dueDate) => {
    const isOverdue = dueDate && dayjs().isAfter(dayjs(dueDate));
    
    switch (status) {
      case 'BORROWED':
        if (isOverdue) {
          return <Tag color="red" icon={<ExclamationCircleOutlined />}>已逾期</Tag>;
        }
        return <Tag color="blue" icon={<BookOutlined />}>借阅中</Tag>;
      case 'RETURNED':
        return <Tag color="green" icon={<CheckCircleOutlined />}>已归还</Tag>;
      case 'OVERDUE':
        return <Tag color="red" icon={<ExclamationCircleOutlined />}>已逾期</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return null;
    const days = dayjs(dueDate).diff(dayjs(), 'day');
    return days;
  };

  const columns = [
    {
      title: '借阅人',
      key: 'userInfo',
      width: 120,
      render: (_, record) => (
        <div className="user-info">
          <div className="user-name">{record.userName}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.userId}
          </Text>
        </div>
      ),
    },
    {
      title: '图书信息',
      key: 'bookInfo',
      render: (_, record) => (
        <div className="book-info">
          <div className="book-title">{record.bookTitle}</div>
          <div className="book-meta">
            <Text type="secondary">作者：{record.bookAuthor}</Text>
            <Text type="secondary">ISBN：{record.bookIsbn}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '借阅时间',
      dataIndex: 'borrowTime',
      key: 'borrowTime',
      width: 120,
      render: (time) => dayjs(time).format('MM-DD HH:mm'),
    },
    {
      title: '应还时间',
      key: 'dueInfo',
      width: 140,
      render: (_, record) => {
        if (!record.dueDate) return '-';
        const daysLeft = getDaysLeft(record.dueDate);
        const isOverdue = daysLeft < 0;
        
        return (
          <div className="due-info">
            <div>{dayjs(record.dueDate).format('MM-DD HH:mm')}</div>
            {record.status === 'BORROWED' && (
              <Text
                type={isOverdue ? 'danger' : daysLeft <= 3 ? 'warning' : 'secondary'}
                style={{ fontSize: '12px' }}
              >
                {isOverdue ? `逾期${Math.abs(daysLeft)}天` : `剩余${daysLeft}天`}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: '归还时间',
      dataIndex: 'returnTime',
      key: 'returnTime',
      width: 120,
      render: (time) => time ? dayjs(time).format('MM-DD HH:mm') : '-',
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => getBorrowStatusTag(record.status, record.dueDate),
    },
    {
      title: '罚金',
      dataIndex: 'fine',
      key: 'fine',
      width: 80,
      render: (fine) => fine > 0 ? <Text type="danger">¥{fine}</Text> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            详情
          </Button>
          {record.status === 'BORROWED' && (
            <Popconfirm
              title="确认代为归还这本书？"
              onConfirm={() => handleReturnBook(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="link"
                icon={<UndoOutlined />}
                loading={returnLoading}
                size="small"
              >
                归还
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (!isTeacherOrAdmin()) {
    return (
      <div className="access-denied">
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#faad14' }} />
            <Title level={3}>权限不足</Title>
            <Text type="secondary">仅老师和管理员可查看所有借阅记录</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="all-borrow-records-container">
      <Card className="header-card">
        <Title level={3}>📋 所有借阅记录</Title>
        <Text type="secondary">管理所有用户的借阅记录</Text>
      </Card>

      {/* 统计信息 */}
      <Card className="statistics-card">
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Statistic
              title="总记录"
              value={statistics.total}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="借阅中"
              value={statistics.borrowed}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="已归还"
              value={statistics.returned}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="逾期"
              value={statistics.overdue}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 搜索和筛选 */}
      <Card className="filter-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="搜索用户名、图书名..."
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Select
              placeholder="状态"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value="BORROWED">借阅中</Option>
              <Option value="RETURNED">已归还</Option>
              <Option value="OVERDUE">已逾期</Option>
            </Select>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col xs={24} sm={24} md={9}>
            <Space wrap>
              <Button 
                icon={<SearchOutlined />}
                onClick={fetchRecords}
              >
                搜索
              </Button>
              <Button
                onClick={() => {
                  setFilters({ keyword: '', status: '', dateRange: null });
                  setPagination(prev => ({ ...prev, current: 1 }));
                  setTimeout(fetchRecords, 100);
                }}
              >
                重置
              </Button>
              <Button icon={<ExportOutlined />}>
                导出记录
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 借阅记录表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={records}
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

      {/* 详情弹窗 */}
      <Modal
        title="借阅记录详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <div className="record-detail">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="借阅人" span={1}>
                <div className="user-detail">
                  <div>{selectedRecord.userName}</div>
                  <Text type="secondary">ID: {selectedRecord.userId}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="联系方式">
                {selectedRecord.userPhone || selectedRecord.userEmail || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="图书名称" span={2}>
                <Text strong>{selectedRecord.bookTitle}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="作者">
                {selectedRecord.bookAuthor}
              </Descriptions.Item>
              <Descriptions.Item label="ISBN">
                {selectedRecord.bookIsbn}
              </Descriptions.Item>
              <Descriptions.Item label="借阅时间">
                {dayjs(selectedRecord.borrowTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="应还时间">
                {selectedRecord.dueDate ? 
                  dayjs(selectedRecord.dueDate).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="归还时间">
                {selectedRecord.returnTime ? 
                  dayjs(selectedRecord.returnTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getBorrowStatusTag(selectedRecord.status, selectedRecord.dueDate)}
              </Descriptions.Item>
              <Descriptions.Item label="罚金">
                {selectedRecord.fine > 0 ? 
                  <Text type="danger">¥{selectedRecord.fine}</Text> : '无'}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {selectedRecord.remark || '无'}
              </Descriptions.Item>
            </Descriptions>

            {selectedRecord.status === 'BORROWED' && (
              <div className="return-action">
                <Popconfirm
                  title={`确认代为归还《${selectedRecord.bookTitle}》？`}
                  onConfirm={() => handleReturnBook(selectedRecord.id)}
                  okText="确认归还"
                  cancelText="取消"
                >
                  <Button 
                    type="primary" 
                    icon={<UndoOutlined />}
                    loading={returnLoading}
                    size="large"
                    style={{ marginTop: 16 }}
                  >
                    代为归还
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllBorrowRecords;