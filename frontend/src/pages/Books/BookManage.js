import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  DatePicker,
  message,
  Popconfirm,
  Tag,
  Typography,
  Row,
  Col,
  Upload,
  Divider
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons';
import { bookAPI } from '../../services/api';
import dayjs from 'dayjs';
import './BookManage.css';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const BookManage = () => {
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
  
  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('add'); // add, edit
  const [editingBook, setEditingBook] = useState(null);
  const [form] = Form.useForm();

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
      
      const response = await bookAPI.getBookList(params);
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

  // 添加图书
  const handleAddBook = () => {
    setModalType('add');
    setEditingBook(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑图书
  const handleEditBook = (book) => {
    setModalType('edit');
    setEditingBook(book);
    form.setFieldsValue({
      ...book,
      publishDate: book.publishDate ? dayjs(book.publishDate) : null,
    });
    setModalVisible(true);
  };

  // 删除图书
  const handleDeleteBook = async (bookId) => {
    try {
      await bookAPI.deleteBook(bookId);
      message.success('删除成功');
      fetchBooks();
    } catch (error) {
      console.error('删除失败:', error);
      message.error(error.message || '删除失败');
    }
  };

  // 修改图书状态
  const handleChangeStatus = async (bookId, status) => {
    try {
      await bookAPI.changeBookStatus(bookId, status);
      message.success('状态更新成功');
      fetchBooks();
    } catch (error) {
      console.error('状态更新失败:', error);
      message.error(error.message || '状态更新失败');
    }
  };

  // 更新库存
  const handleUpdateStock = async (bookId, stock) => {
    try {
      await bookAPI.updateStock(bookId, stock);
      message.success('库存更新成功');
      fetchBooks();
    } catch (error) {
      console.error('库存更新失败:', error);
      message.error(error.message || '库存更新失败');
    }
  };

  // 保存图书
  const handleSave = async (values) => {
    try {
      const data = {
        ...values,
        publishDate: values.publishDate ? values.publishDate.format('YYYY-MM-DD') : null,
      };

      if (modalType === 'add') {
        await bookAPI.addBook(data);
        message.success('添加成功');
      } else {
        await bookAPI.updateBook(editingBook.id, data);
        message.success('更新成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchBooks();
    } catch (error) {
      console.error('保存失败:', error);
      message.error(error.message || '保存失败');
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
      width: 250,
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
      width: 100,
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher',
      width: 150,
      ellipsis: true,
    },
    {
      title: '库存',
      key: 'stock',
      width: 120,
      render: (_, record) => (
        <div className="stock-control">
          <InputNumber
            size="small"
            value={record.stock}
            min={0}
            onChange={(value) => handleUpdateStock(record.id, value)}
            style={{ width: '80px' }}
          />
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Select
          size="small"
          value={record.status}
          onChange={(value) => handleChangeStatus(record.id, value)}
          style={{ width: '100px' }}
        >
          <Option value="AVAILABLE">可借</Option>
          <Option value="UNAVAILABLE">不可借</Option>
          <Option value="MAINTENANCE">维护中</Option>
        </Select>
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
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditBook(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除这本书？"
            onConfirm={() => handleDeleteBook(record.id)}
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

  return (
    <div className="book-manage-container">
      <Card className="header-card">
        <Title level={3}>📖 图书管理</Title>
        <Text type="secondary">管理图书信息、库存和状态</Text>
      </Card>

      {/* 操作栏 */}
      <Card className="toolbar-card">
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} lg={12}>
            <Space wrap>
              <Search
                placeholder="搜索图书名称、作者、ISBN..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              <Select
                placeholder="分类"
                allowClear
                style={{ width: 120 }}
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
              <Select
                placeholder="状态"
                allowClear
                style={{ width: 120 }}
                onChange={(value) => handleFilterChange('status', value)}
              >
                <Option value="AVAILABLE">可借</Option>
                <Option value="UNAVAILABLE">不可借</Option>
                <Option value="MAINTENANCE">维护中</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} lg={12} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddBook}
              >
                添加图书
              </Button>
              <Button icon={<ImportOutlined />}>
                批量导入
              </Button>
              <Button icon={<ExportOutlined />}>
                导出数据
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
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 添加/编辑图书弹窗 */}
      <Modal
        title={modalType === 'add' ? '添加图书' : '编辑图书'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            status: 'AVAILABLE',
            stock: 1,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="书名"
                rules={[{ required: true, message: '请输入书名' }]}
              >
                <Input placeholder="请输入书名" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="author"
                label="作者"
                rules={[{ required: true, message: '请输入作者' }]}
              >
                <Input placeholder="请输入作者" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="isbn"
                label="ISBN"
                rules={[
                  { required: true, message: '请输入ISBN' },
                  { pattern: /^(978|979)\d{10}$/, message: 'ISBN格式不正确' }
                ]}
              >
                <Input placeholder="例如：9787121234567" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="请选择分类">
                  <Option value="文学">文学</Option>
                  <Option value="科技">科技</Option>
                  <Option value="历史">历史</Option>
                  <Option value="哲学">哲学</Option>
                  <Option value="艺术">艺术</Option>
                  <Option value="教育">教育</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="publisher"
                label="出版社"
                rules={[{ required: true, message: '请输入出版社' }]}
              >
                <Input placeholder="请输入出版社" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="publishDate"
                label="出版日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={12} md={8}>
              <Form.Item
                name="stock"
                label="库存数量"
                rules={[{ required: true, message: '请输入库存数量' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="库存数量"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item
                name="price"
                label="价格（元）"
              >
                <InputNumber
                  min={0}
                  precision={2}
                  placeholder="图书价格"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  <Option value="AVAILABLE">可借</Option>
                  <Option value="UNAVAILABLE">不可借</Option>
                  <Option value="MAINTENANCE">维护中</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="图书简介"
          >
            <TextArea
              rows={4}
              placeholder="请输入图书简介"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="coverImage"
            label="封面图片"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传封面</div>
              </div>
            </Upload>
          </Form.Item>

          <Divider />

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
      </Modal>
    </div>
  );
};

export default BookManage;