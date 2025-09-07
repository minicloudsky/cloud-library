// 通用类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export interface PaginationParams {
  current: number;
  pageSize: number;
  total?: number;
}

export interface PaginatedData<T = any> {
  records: T[];
  total: number;
  current: number;
  size: number;
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  realName?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: boolean;
  createTime?: string;
  updateTime?: string;
  lastLoginTime?: string;
}

export interface UserRole {
  code: number;
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword?: string;
  realName: string;
  email?: string;
  phone?: string;
  role: number;
}

// 图书相关类型
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publishDate?: string;
  stock: number;
  availableStock?: number;
  price?: number;
  status: BookStatus;
  description?: string;
  coverImage?: string;
  createTime?: string;
  updateTime?: string;
}

export type BookStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';

export interface BookRequest {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publishDate?: string;
  stock: number;
  price?: number;
  status: BookStatus;
  description?: string;
  coverImage?: string;
}

// 借阅相关类型
export interface BorrowRecord {
  id: number;
  userId: number;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string;
  borrowTime: string;
  dueDate?: string;
  returnTime?: string;
  status: BorrowStatus;
  fine: number;
  remark?: string;
}

export type BorrowStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE';

export interface BorrowRequest {
  bookId: number;
  userId: number;
}

// 菜单和路由类型
export interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  children?: MenuItem[];
  path?: string;
  requiredRole?: number;
  requiredPermission?: string;
}

// 统计数据类型
export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  totalBorrows: number;
  myBorrows: number;
  totalUsers?: number;
  activeUsers?: number;
}

export interface UserStats {
  total: number;
  students: number;
  teachers: number;
  admins: number;
  active: number;
  inactive: number;
}

export interface BorrowStats {
  total: number;
  borrowed: number;
  returned: number;
  overdue: number;
}

// 权限相关类型
export const enum UserRoleCode {
  STUDENT = 1,
  TEACHER = 2,
  ADMIN = 3,
}

export const enum Permission {
  BORROW_BOOK = 'BORROW_BOOK',
  RETURN_BOOK = 'RETURN_BOOK',
  MANAGE_BOOK = 'MANAGE_BOOK',
  MANAGE_USER = 'MANAGE_USER',
  ADMIN_OPERATION = 'ADMIN_OPERATION',
}

// 表单相关类型
export interface SearchFormValues {
  keyword?: string;
  category?: string;
  status?: string;
  dateRange?: [string, string];
}

export interface BookSearchParams extends PaginationParams {
  keyword?: string;
  category?: string;
  status?: BookStatus;
}

export interface BorrowSearchParams extends PaginationParams {
  keyword?: string;
  status?: BorrowStatus;
  startDate?: string;
  endDate?: string;
}

export interface UserSearchParams extends PaginationParams {
  keyword?: string;
  role?: number;
  status?: string;
}