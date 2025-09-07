import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, List, Tag, Typography, Empty } from 'antd';
import { 
  BookOutlined, 
  UserOutlined, 
  ReadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { bookAPI, borrowAPI, userAPI } from '../services/api';
import './Home.css';

const { Title, Text } = Typography;

const Home = () => {
  const { user, isTeacherOrAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalBorrows: 0,
    myBorrows: 0
  });
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取统计数据
      const [booksRes, availableBooksRes, borrowsRes] = await Promise.all([
        bookAPI.getBookList({ current: 1, size: 1 }),
        bookAPI.getAvailableBooks({ current: 1, size: 1 }),
        borrowAPI.getBorrowRecords({ current: 1, size: 1 })
      ]);

      setStatistics({
        totalBooks: booksRes.data.total,
        availableBooks: availableBooksRes.data.total,
        totalBorrows: borrowsRes.data.total,
        myBorrows: 0 // 待实现
      });

      // 获取最近借阅记录
      if (isTeacherOrAdmin()) {
        const recentBorrowsRes = await borrowAPI.getBorrowRecords({ 
          current: 1, 
          size: 5 
        });
        setRecentBorrows(recentBorrowsRes.data.records || []);
      }

      // 获取热门图书
      const popularBooksRes = await bookAPI.getBookList({ 
        current: 1, 
        size: 5 
      });
      setPopularBooks(popularBooksRes.data.records || []);

    } catch (error) {
      console.error('获取首页数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBorrowStatusTag = (status) => {
    switch (status) {
      case 'BORROWED':
        return <Tag color="blue" icon={<ReadOutlined />}>借阅中</Tag>;
      case 'RETURNED':
        return <Tag color="green" icon={<CheckCircleOutlined />}>已归还</Tag>;
      case 'OVERDUE':
        return <Tag color="red" icon={<ExclamationCircleOutlined />}>已逾期</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const borrowColumns = [
    {
      title: '图书名称',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
    },
    {
      title: '借阅人',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '借阅时间',
      dataIndex: 'borrowTime',
      key: 'borrowTime',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getBorrowStatusTag(status),
    },
  ];

  return (
    <div className="home-container">
      <div className="welcome-section">
        <Title level={2}>
          欢迎回来，{user?.realName || user?.username} 👋
        </Title>
        <Text type="secondary">
          今天是 {new Date().toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long' 
          })}
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="statistics-section">
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="图书总数"
              value={statistics.totalBooks}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="可借图书"
              value={statistics.availableBooks}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="借阅总数"
              value={statistics.totalBorrows}
              prefix={<ReadOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="我的借阅"
              value={statistics.myBorrows}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="content-section">
        {/* 热门图书 */}
        <Col xs={24} lg={12}>
          <Card title="热门图书" className="section-card">
            {popularBooks.length > 0 ? (
              <List
                dataSource={popularBooks}
                renderItem={(book) => (
                  <List.Item>
                    <List.Item.Meta
                      title={book.title}
                      description={
                        <div>
                          <Text type="secondary">作者：{book.author}</Text>
                          <br />
                          <Text type="secondary">库存：{book.stock}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无图书数据" />
            )}
          </Card>
        </Col>

        {/* 最近借阅记录 */}
        <Col xs={24} lg={12}>
          <Card title="最近借阅" className="section-card">
            {isTeacherOrAdmin() ? (
              recentBorrows.length > 0 ? (
                <Table
                  dataSource={recentBorrows}
                  columns={borrowColumns}
                  pagination={false}
                  size="small"
                />
              ) : (
                <Empty description="暂无借阅记录" />
              )
            ) : (
              <div className="access-info">
                <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                <p>仅老师和管理员可查看所有借阅记录</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Card title="快速操作" className="quick-actions">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={6}>
            <Card 
              hoverable 
              className="action-card"
              onClick={() => window.location.href = '/books/browse'}
            >
              <div className="action-content">
                <BookOutlined className="action-icon" />
                <Text>浏览图书</Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={12} sm={8} md={6}>
            <Card 
              hoverable 
              className="action-card"
              onClick={() => window.location.href = '/borrow/my-records'}
            >
              <div className="action-content">
                <ReadOutlined className="action-icon" />
                <Text>我的借阅</Text>
              </div>
            </Card>
          </Col>

          {isTeacherOrAdmin() && (
            <>
              <Col xs={12} sm={8} md={6}>
                <Card 
                  hoverable 
                  className="action-card"
                  onClick={() => window.location.href = '/books/manage'}
                >
                  <div className="action-content">
                    <BookOutlined className="action-icon" />
                    <Text>管理图书</Text>
                  </div>
                </Card>
              </Col>

              <Col xs={12} sm={8} md={6}>
                <Card 
                  hoverable 
                  className="action-card"
                  onClick={() => window.location.href = '/users'}
                >
                  <div className="action-content">
                    <UserOutlined className="action-icon" />
                    <Text>用户管理</Text>
                  </div>
                </Card>
              </Col>
            </>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default Home;