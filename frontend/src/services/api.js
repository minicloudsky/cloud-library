import request from '../utils/request';

// 用户API
export const userAPI = {
  // 登录
  login: (data) => request.post('/user/login', data),
  
  // 注册
  register: (data) => request.post('/user/register', data),
  
  // 获取用户信息
  getUserInfo: (userId) => request.get(`/user/info/${userId}`),
  
  // 获取用户列表
  getUserList: (params) => request.get('/user/list', { params }),
  
  // 更新用户
  updateUser: (userId, data) => request.put(`/user/${userId}`, data),
  
  // 删除用户
  deleteUser: (userId) => request.delete(`/user/${userId}`),
  
  // 修改用户状态
  changeUserStatus: (userId, status) => request.put(`/user/${userId}/status`, null, {
    params: { status }
  }),
  
  // 检查用户权限
  hasPermission: (userId, permission) => request.get(`/user/${userId}/permission/${permission}`)
};

// 图书API
export const bookAPI = {
  // 获取图书列表
  getBookList: (params) => request.get('/book/list', { params }),
  
  // 获取可借阅图书列表
  getAvailableBooks: (params) => request.get('/book/available', { params }),
  
  // 获取图书详情
  getBookById: (bookId) => request.get(`/book/${bookId}`),
  
  // 添加图书
  addBook: (data) => request.post('/book', data),
  
  // 更新图书
  updateBook: (bookId, data) => request.put(`/book/${bookId}`, data),
  
  // 删除图书
  deleteBook: (bookId) => request.delete(`/book/${bookId}`),
  
  // 修改图书状态
  changeBookStatus: (bookId, status) => request.put(`/book/${bookId}/status`, null, {
    params: { status }
  }),
  
  // 更新库存
  updateStock: (bookId, stock) => request.put(`/book/${bookId}/stock`, null, {
    params: { stock }
  })
};

// 借阅API
export const borrowAPI = {
  // 借阅图书
  borrowBook: (data) => request.post('/borrow', data),
  
  // 归还图书
  returnBook: (recordId) => request.put(`/borrow/${recordId}/return`),
  
  // 获取借阅记录
  getBorrowRecords: (params) => request.get('/borrow/records', { params }),
  
  // 获取用户借阅记录
  getUserBorrowRecords: (userId, params) => request.get(`/borrow/user/${userId}`, { params }),
  
  // 获取图书借阅记录
  getBookBorrowRecords: (bookId, params) => request.get(`/borrow/book/${bookId}`, { params })
};