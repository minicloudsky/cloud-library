import axios from 'axios';
import { message } from 'antd';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  Book, 
  BorrowRecord, 
  Result, 
  PageResult 
} from '../types';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code !== 200) {
      message.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    message.error(error.response?.data?.message || '网络错误');
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (params: LoginRequest): Promise<Result<LoginResponse>> =>
    request.post('/auth/login', params),
    
  register: (params: RegisterRequest): Promise<Result<User>> =>
    request.post('/auth/register', params),
    
  getCurrentUser: (): Promise<Result<User>> =>
    request.get('/auth/current'),
};

export const bookAPI = {
  getBooks: (params: {
    page?: number;
    size?: number;
    keyword?: string;
    category?: string;
  }): Promise<Result<PageResult<Book>>> =>
    request.get('/books/page', { params }),
    
  getBook: (id: number): Promise<Result<Book>> =>
    request.get(`/books/${id}`),
    
  addBook: (params: Partial<Book>): Promise<Result<Book>> =>
    request.post('/books', params),
    
  updateBook: (id: number, params: Partial<Book>): Promise<Result<Book>> =>
    request.put(`/books/${id}`, params),
    
  deleteBook: (id: number): Promise<Result<boolean>> =>
    request.delete(`/books/${id}`),
    
  updateBookStatus: (id: number, status: string): Promise<Result<Book>> =>
    request.put(`/books/${id}/status`, null, { params: { status } }),
};

export const borrowAPI = {
  borrowBook: (bookId: number): Promise<Result<BorrowRecord>> =>
    request.post(`/borrow/${bookId}`),
    
  returnBook: (recordId: number): Promise<Result<BorrowRecord>> =>
    request.put(`/borrow/return/${recordId}`),
    
  getBorrowRecords: (params: {
    page?: number;
    size?: number;
    keyword?: string;
    status?: string;
  }): Promise<Result<PageResult<BorrowRecord>>> =>
    request.get('/borrow/records', { params }),
    
  getMyBorrowRecords: (params: {
    page?: number;
    size?: number;
  }): Promise<Result<PageResult<BorrowRecord>>> =>
    request.get('/borrow/my-records', { params }),
};

export const userAPI = {
  getUsers: (params: {
    page?: number;
    size?: number;
    keyword?: string;
  }): Promise<Result<PageResult<User>>> =>
    request.get('/users/page', { params }),
    
  getUser: (id: number): Promise<Result<User>> =>
    request.get(`/users/${id}`),
    
  updateUserStatus: (id: number, status: number): Promise<Result<User>> =>
    request.put(`/users/${id}/status`, null, { params: { status } }),
};