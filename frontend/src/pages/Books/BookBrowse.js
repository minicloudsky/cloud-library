import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Select, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Typography, 
  message,
  Row,
  Col,
  Statistic,
  Descriptions,
  Popconfirm
} from 'antd';
import { 
  SearchOutlined, 
  BookOutlined, 
  EyeOutlined, 
  HeartOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { bookAPI, borrowAPI } from '../../services/api';
import './BookBrowse.css';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const BookBrowse = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    status: '',
  });
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [pagination.current, pagination.pageSize]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {
        current: pagination.current,
        size: pagination.pageSize,
        ...filters,
      };
      
      const response = await bookAPI.getAvailableBooks(params);
      const { records, total } = response.data;
      
      setBooks(records || []);
      setPagination(prev => ({
        ...prev,
        total,
      }));
    } catch (error) {
      console.error('获取图书列表失败:', error);
      message.error('获取图书列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(fetchBooks, 100);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(fetchBooks, 100);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleViewDetail = (book) => {
    setSelectedBook(book);
    setDetailModalVisible(true);
  };

  const handleBorrowBook = async (bookId) => {
    setBorrowLoading(true);
    try {
      await borrowAPI.borrowBook({
        bookId,
        userId: user.id,
      });
      message.success('借阅成功！');
      fetchBooks(); // 刷新列表
      setDetailModalVisible(false);
    } catch (error) {
      console.error('借阅失败:', error);
      message.error(error.message || '借阅失败');
    } finally {
      setBorrowLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'AVAILABLE': { color: 'green', text: '可借' },
      'UNAVAILABLE': { color: 'red', text: '不可借' },
      'MAINTENANCE': { color: 'orange', text: '维护中' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: '图书信息',
      key: 'bookInfo',
      render: (_, record) => (
        <div className="book-info">
          <div className="book-title">{record.title}</div>
          <div className="book-meta">
            <Text type="secondary">作者：{record.author}</Text>
            <Text type="secondary" className="isbn">ISBN：{record.isbn}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '库存',
      key: 'stock',
      width: 100,
      render: (_, record) => (
        <div className="stock-info">
          <div>{record.stock}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            可借：{record.availableStock || record.stock}
          </Text>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher',
      width: 150,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
          {record.status === 'AVAILABLE' && record.stock > 0 && (
            <Popconfirm
              title="确认借阅这本书？"
              onConfirm={() => handleBorrowBook(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="link"
                icon={<DownloadOutlined />}
                size="small"
                loading={borrowLoading}
              >
                借阅
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="book-browse-container">
      <Card className="header-card">
        <Title level={3}>📚 图书浏览</Title>
        <Text type="secondary">浏览和借阅图书</Text>
      </Card>

      {/* 搜索和筛选 */}
      <Card className="filter-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="搜索图书名称、作者、ISBN..."
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="分类"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('category', value)}
            >
              <Option value="文学">文学</Option>
              <Option value="科技">科技</Option>
              <Option value="历史">历史</Option>
              <Option value="哲学">哲学</Option>
              <Option value="艺术">艺术</Option>
              <Option value="教育">教育</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="状态"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value="AVAILABLE">可借</Option>
              <Option value="UNAVAILABLE">不可借</Option>
              <Option value="MAINTENANCE">维护中</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8} lg={12}>
            <Space>
              <Button 
                icon={<SearchOutlined />}
                onClick={fetchBooks}
              >
                搜索
              </Button>
              <Button
                onClick={() => {
                  setFilters({ keyword: '', category: '', status: '' });
                  setPagination(prev => ({ ...prev, current: 1 }));
                  setTimeout(fetchBooks, 100);
                }}
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 图书列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={books}
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
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 图书详情弹窗 */}
      <Modal
        title="图书详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
        className="book-detail-modal"
      >
        {selectedBook && (
          <div className="book-detail">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="书名" span={2}>
                <Text strong>{selectedBook.title}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="作者">
                {selectedBook.author}
              </Descriptions.Item>
              <Descriptions.Item label="ISBN">
                {selectedBook.isbn}
              </Descriptions.Item>
              <Descriptions.Item label="分类">
                <Tag color="blue">{selectedBook.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(selectedBook.status)}
              </Descriptions.Item>
              <Descriptions.Item label="出版社">
                {selectedBook.publisher}
              </Descriptions.Item>
              <Descriptions.Item label="出版日期">
                {selectedBook.publishDate}
              </Descriptions.Item>
              <Descriptions.Item label="库存数量">
                <Statistic
                  value={selectedBook.stock}
                  suffix="本"
                  valueStyle={{ fontSize: '16px' }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="可借数量">
                <Statistic
                  value={selectedBook.availableStock || selectedBook.stock}
                  suffix="本"
                  valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="图书简介" span={2}>
                <Text>{selectedBook.description || '暂无简介'}</Text>
              </Descriptions.Item>
            </Descriptions>

            {selectedBook.status === 'AVAILABLE' && selectedBook.stock > 0 && (
              <div className="borrow-actions">
                <Popconfirm
                  title={`确认借阅《${selectedBook.title}》？`}
                  onConfirm={() => handleBorrowBook(selectedBook.id)}
                  okText="确认借阅"
                  cancelText="取消"
                >
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    loading={borrowLoading}
                    size="large"
                  >
                    立即借阅
                  </Button>
                </Popconfirm>
                <Button 
                  icon={<HeartOutlined />}
                  size="large"
                >
                  收藏
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookBrowse;