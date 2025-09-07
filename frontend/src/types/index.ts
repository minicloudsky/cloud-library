export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  DELETED = 'DELETED'
}

export enum BorrowStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  LOST = 'LOST'
}

export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  realName?: string;
  studentId?: string;
  role: UserRole;
  status: number;
  createTime: string;
  updateTime: string;
}

export interface Book {
  id: number;
  isbn?: string;
  title: string;
  author?: string;
  publisher?: string;
  publishDate?: string;
  category?: string;
  price?: number;
  totalQuantity: number;
  availableQuantity: number;
  description?: string;
  coverUrl?: string;
  location?: string;
  status: BookStatus;
  createTime: string;
  updateTime: string;
}

export interface BorrowRecord {
  id: number;
  userId: number;
  bookId: number;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  fineAmount: number;
  remark?: string;
  createTime: string;
  updateTime: string;
  user?: User;
  book?: Book;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  realName: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  realName: string;
  studentId?: string;
  role?: UserRole;
}

export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}