import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Modal, 
  Form, 
  message, 
  Tag, 
  Popconfirm,
  Card
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { bookAPI } from '../../services/api';
import { getUser } from '../../utils/auth';
import type { Book, PageResult } from '../../types';
import { BookStatus, UserRole } from '../../types';

const { Search } = Input;
const { Option } = Select;

const BookManage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form] = Form.useForm();
  
  const user = getUser();
  const canModify = user?.role === UserRole.TEACHER || user?.role === UserRole.ADMIN;
  const canDelete = user?.role === UserRole.ADMIN;

  const fetchBooks = async (page = 1, size = 10, search = '', cat = '') => {
    setLoading(true);
    try {
      const response = await bookAPI.getBooks({
        page,
        size,
        keyword: search,
        category: cat,
      });
      setBooks(response.data.records);
      setTotal(response.data.total);
      setCurrent(page);
    } catch (error) {
      console.error('获取图书列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1);
    fetchBooks(1, pageSize, value, category);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrent(1);
    fetchBooks(1, pageSize, keyword, value);
  };

  const handleTableChange = (pagination: any) => {
    fetchBooks(pagination.current, pagination.pageSize, keyword, category);
  };

  const handleAdd = () => {
    setEditingBook(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Book) => {
    setEditingBook(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await bookAPI.deleteBook(id);
      message.success('删除成功');
      fetchBooks(current, pageSize, keyword, category);
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleBorrow = async (bookId: number) => {
    try {
      const { borrowAPI } = await import('../../services/api');
      await borrowAPI.borrowBook(bookId);
      message.success('借阅成功');
      fetchBooks(current, pageSize, keyword, category);
    } catch (error) {
      console.error('借阅失败:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingBook) {
        await bookAPI.updateBook(editingBook.id, values);
        message.success('更新成功');
      } else {
        await bookAPI.addBook(values);
        message.success('添加成功');
      }
      setIsModalOpen(false);
      fetchBooks(current, pageSize, keyword, category);
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const columns: ColumnsType<Book> = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      width: 120,
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher',
      width: 120,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      render: (price: number) => price ? `¥${price}` : '-',
    },
    {
      title: '库存',
      key: 'quantity',
      width: 100,
      render: (_, record) => `${record.availableQuantity}/${record.totalQuantity}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: BookStatus) => (
        <Tag color={status === BookStatus.AVAILABLE ? 'green' : 'red'}>
          {status === BookStatus.AVAILABLE ? '可借' : '不可借'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === BookStatus.AVAILABLE && record.availableQuantity > 0 && (
            <Button 
              size="small" 
              type="primary"
              onClick={() => handleBorrow(record.id)}
            >
              借阅
            </Button>
          )}
          {canModify && (
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="确定删除这本书吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                size="small" 
                danger 
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="搜索书名、作者、ISBN"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          <Select
            placeholder="选择分类"
            style={{ width: 120 }}
            allowClear
            onChange={handleCategoryChange}
          >
            <Option value="计算机">计算机</Option>
            <Option value="文学">文学</Option>
            <Option value="历史">历史</Option>
            <Option value="科学">科学</Option>
          </Select>
          {canModify && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加图书
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={books}
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
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingBook ? '编辑图书' : '添加图书'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="isbn"
            label="ISBN"
            rules={[{ required: true, message: '请输入ISBN' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="title"
            label="书名"
            rules={[{ required: true, message: '请输入书名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="author" label="作者">
            <Input />
          </Form.Item>
          <Form.Item name="publisher" label="出版社">
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select>
              <Option value="计算机">计算机</Option>
              <Option value="文学">文学</Option>
              <Option value="历史">历史</Option>
              <Option value="科学">科学</Option>
            </Select>
          </Form.Item>
          <Form.Item name="price" label="价格">
            <Input type="number" addonBefore="¥" />
          </Form.Item>
          <Form.Item
            name="totalQuantity"
            label="总数量"
            rules={[{ required: true, message: '请输入总数量' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item name="location" label="存放位置">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default BookManage;