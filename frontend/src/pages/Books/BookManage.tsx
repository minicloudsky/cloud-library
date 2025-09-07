import React, { useRef, useState } from 'react';
import { ProTable, ProColumns, ActionType } from '@ant-design/pro-table';
import { ProForm, ProFormText, ProFormSelect, ProFormTextArea, ProFormDigit } from '@ant-design/pro-form';
import { Card, Button, Space, Modal, Popconfirm, Tag, message, Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { bookAPI } from '@/services/api';
import type { Book, BookRequest, BookStatus } from '@/types';
import dayjs from 'dayjs';

const BookManage: React.FC = () => {
  const { isTeacherOrAdmin } = useAuth();
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [form] = ProForm.useForm<BookRequest>();

  // 权限检查
  if (!isTeacherOrAdmin()) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <h3>权限不足</h3>
          <p>仅老师和管理员可管理图书</p>
        </div>
      </Card>
    );
  }

  // 表格列定义
  const columns: ProColumns<Book>[] = [
    {
      title: '图书信息',
      key: 'bookInfo',
      search: false,
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{record.title}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            作者：{record.author} | ISBN：{record.isbn}
          </div>
        </div>
      ),
    },
    {
      title: '图书名称',
      dataIndex: 'title',
      key: 'title',
      hideInTable: true,
      copyable: true,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      hideInTable: true,
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      hideInTable: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      valueType: 'select',
      valueEnum: {
        '文学': { text: '文学', status: 'Default' },
        '科技': { text: '科技', status: 'Processing' },
        '历史': { text: '历史', status: 'Success' },
        '哲学': { text: '哲学', status: 'Warning' },
        '艺术': { text: '艺术', status: 'Error' },
        '教育': { text: '教育', status: 'Default' },
        '其他': { text: '其他', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color="blue">{record.category}</Tag>
      ),
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      search: false,
      sorter: true,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, color: '#1890ff' }}>{record.stock}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        'AVAILABLE': { text: '可借', status: 'Success' },
        'UNAVAILABLE': { text: '不可借', status: 'Error' },
        'MAINTENANCE': { text: '维护中', status: 'Warning' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120,
      valueType: 'dateTime',
      search: false,
      sorter: true,
      render: (_, record) => 
        record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>,
        <Popconfirm
          key="delete"
          title="确认删除这本书？"
          onConfirm={() => handleDelete(record.id)}
          okText="确认"
          cancelText="取消"
        >
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  // 处理添加
  const handleAdd = () => {
    setModalType('add');
    setEditingBook(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (book: Book) => {
    setModalType('edit');
    setEditingBook(book);
    form.setFieldsValue({
      ...book,
      publishDate: book.publishDate ? dayjs(book.publishDate) : undefined,
    });
    setModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (bookId: number) => {
    try {
      await bookAPI.deleteBook(bookId);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // 处理保存
  const handleSave = async (values: BookRequest) => {
    try {
      if (modalType === 'add') {
        await bookAPI.addBook(values);
        message.success('添加图书成功');
      } else if (editingBook) {
        await bookAPI.updateBook(editingBook.id, values);
        message.success('更新图书成功');
      }
      
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <ProTable<Book>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          try {
            const response = await bookAPI.getBookList({
              current: params.current || 1,
              pageSize: params.pageSize || 10,
              keyword: params.title || params.author || params.isbn,
              category: params.category,
              status: params.status as BookStatus,
            });
            
            return {
              data: response.data.records || [],
              total: response.data.total || 0,
              success: true,
            };
          } catch (error) {
            console.error('获取图书列表失败:', error);
            return {
              data: [],
              total: 0,
              success: false,
            };
          }
        }}
        editable={{
          type: 'multiple',
        }}
        columnsState={{
          persistenceKey: 'pro-table-book-manage',
          persistenceType: 'localStorage',
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
          optionRender: (searchConfig, formProps, dom) => [
            ...dom.reverse(),
            <Button
              key="export"
              icon={<ExportOutlined />}
              onClick={() => {
                message.info('导出功能开发中...');
              }}
            >
              导出
            </Button>,
          ],
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          pageSize: 10,
          onChange: (page) => console.log(page),
        }}
        dateFormatter="string"
        headerTitle="图书管理"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加图书
          </Button>,
        ]}
      />

      {/* 添加/编辑表单弹窗 */}
      <Modal
        title={modalType === 'add' ? '添加图书' : '编辑图书'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <ProForm<BookRequest>
          form={form}
          onFinish={handleSave}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={{
            status: 'AVAILABLE',
            stock: 1,
          }}
          submitter={{
            render: (props, dom) => (
              <div style={{ textAlign: 'right', paddingTop: '16px' }}>
                <Space>
                  <Button onClick={() => setModalVisible(false)}>
                    取消
                  </Button>
                  <Button
                    type="primary"
                    loading={props.loading}
                    onClick={() => props.form?.submit?.()}
                  >
                    {modalType === 'add' ? '添加' : '更新'}
                  </Button>
                </Space>
              </div>
            ),
          }}
        >
          <ProFormText
            name="title"
            label="书名"
            rules={[{ required: true, message: '请输入书名' }]}
            placeholder="请输入书名"
          />

          <ProFormText
            name="author"
            label="作者"
            rules={[{ required: true, message: '请输入作者' }]}
            placeholder="请输入作者"
          />

          <ProFormText
            name="isbn"
            label="ISBN"
            rules={[
              { required: true, message: '请输入ISBN' },
              { pattern: /^(978|979)\d{10}$/, message: 'ISBN格式不正确' }
            ]}
            placeholder="例如：9787121234567"
          />

          <ProFormSelect
            name="category"
            label="分类"
            valueEnum={{
              '文学': '文学',
              '科技': '科技',
              '历史': '历史',
              '哲学': '哲学',
              '艺术': '艺术',
              '教育': '教育',
              '其他': '其他',
            }}
            placeholder="请选择分类"
            rules={[{ required: true, message: '请选择分类' }]}
          />

          <ProFormText
            name="publisher"
            label="出版社"
            rules={[{ required: true, message: '请输入出版社' }]}
            placeholder="请输入出版社"
          />

          <ProFormDigit
            name="stock"
            label="库存数量"
            min={0}
            max={9999}
            rules={[{ required: true, message: '请输入库存数量' }]}
            fieldProps={{ precision: 0 }}
          />

          <ProFormDigit
            name="price"
            label="价格（元）"
            min={0}
            max={99999}
            fieldProps={{ 
              precision: 2,
              addonBefore: '¥',
            }}
          />

          <ProFormSelect
            name="status"
            label="状态"
            valueEnum={{
              'AVAILABLE': '可借',
              'UNAVAILABLE': '不可借',
              'MAINTENANCE': '维护中',
            }}
            rules={[{ required: true, message: '请选择状态' }]}
          />

          <ProFormTextArea
            name="description"
            label="图书简介"
            placeholder="请输入图书简介"
            fieldProps={{
              rows: 4,
              maxLength: 500,
              showCount: true,
            }}
          />
        </ProForm>
      </Modal>
    </div>
  );
};

export default BookManage;