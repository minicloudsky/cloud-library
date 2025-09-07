import request from '@/utils/request';
import type { 
  ApiResponse, 
  User, 
  LoginRequest, 
  RegisterRequest, 
  Book, 
  BookRequest, 
  BookSearchParams,
  BorrowRecord, 
  BorrowRequest,
  BorrowSearchParams,
  UserSearchParams,
  PaginatedData 
} from '@/types';

// 用户API
export const userAPI = {
  // 登录
  login: (data: LoginRequest): Promise<ApiResponse<string>> => 
    request.post('/user/login', data),
  
  // 注册
  register: (data: RegisterRequest): Promise<ApiResponse<User>> => 
    request.post('/user/register', data),
  
  // 获取用户信息
  getUserInfo: (userId: number): Promise<ApiResponse<User>> => 
    request.get(`/user/info/${userId}`),
  
  // 获取用户列表
  getUserList: (params: UserSearchParams): Promise<ApiResponse<PaginatedData<User>>> => 
    request.get('/user/list', { params }),
  
  // 更新用户
  updateUser: (userId: number, data: Partial<User>): Promise<ApiResponse<User>> => 
    request.put(`/user/${userId}`, data),
  
  // 删除用户
  deleteUser: (userId: number): Promise<ApiResponse<void>> => 
    request.delete(`/user/${userId}`),
  
  // 修改用户状态
  changeUserStatus: (userId: number, status: boolean): Promise<ApiResponse<void>> => 
    request.put(`/user/${userId}/status`, null, { params: { status } }),
  
  // 检查用户权限
  hasPermission: (userId: number, permission: string): Promise<ApiResponse<boolean>> => 
    request.get(`/user/${userId}/permission/${permission}`)
};

// 图书API
export const bookAPI = {
  // 获取图书列表
  getBookList: (params: BookSearchParams): Promise<ApiResponse<PaginatedData<Book>>> => 
    request.get('/book/list', { params }),
  
  // 获取可借阅图书列表
  getAvailableBooks: (params: BookSearchParams): Promise<ApiResponse<PaginatedData<Book>>> => 
    request.get('/book/available', { params }),
  
  // 获取图书详情
  getBookById: (bookId: number): Promise<ApiResponse<Book>> => 
    request.get(`/book/${bookId}`),
  
  // 添加图书
  addBook: (data: BookRequest): Promise<ApiResponse<Book>> => 
    request.post('/book', data),
  
  // 更新图书
  updateBook: (bookId: number, data: BookRequest): Promise<ApiResponse<Book>> => 
    request.put(`/book/${bookId}`, data),
  
  // 删除图书
  deleteBook: (bookId: number): Promise<ApiResponse<void>> => 
    request.delete(`/book/${bookId}`),
  
  // 修改图书状态
  changeBookStatus: (bookId: number, status: string): Promise<ApiResponse<void>> => 
    request.put(`/book/${bookId}/status`, null, { params: { status } }),
  
  // 更新库存
  updateStock: (bookId: number, stock: number): Promise<ApiResponse<void>> => 
    request.put(`/book/${bookId}/stock`, null, { params: { stock } }),

  // 减少库存
  decreaseStock: (bookId: number, count: number): Promise<ApiResponse<boolean>> => 
    request.post(`/book/${bookId}/decrease-stock`, null, { params: { count } }),

  // 增加库存
  increaseStock: (bookId: number, count: number): Promise<ApiResponse<void>> => 
    request.post(`/book/${bookId}/increase-stock`, null, { params: { count } })
};

// 借阅API
export const borrowAPI = {
  // 借阅图书
  borrowBook: (data: BorrowRequest): Promise<ApiResponse<BorrowRecord>> => 
    request.post('/borrow', data),
  
  // 归还图书
  returnBook: (recordId: number): Promise<ApiResponse<void>> => 
    request.put(`/borrow/${recordId}/return`),
  
  // 获取借阅记录
  getBorrowRecords: (params: BorrowSearchParams): Promise<ApiResponse<PaginatedData<BorrowRecord>>> => 
    request.get('/borrow/records', { params }),
  
  // 获取用户借阅记录
  getUserBorrowRecords: (userId: number, params: BorrowSearchParams): Promise<ApiResponse<PaginatedData<BorrowRecord>>> => 
    request.get(`/borrow/user/${userId}`, { params }),
  
  // 获取图书借阅记录
  getBookBorrowRecords: (bookId: number, params: BorrowSearchParams): Promise<ApiResponse<PaginatedData<BorrowRecord>>> => 
    request.get(`/borrow/book/${bookId}`, { params })
};

export default {
  userAPI,
  bookAPI,
  borrowAPI,
};