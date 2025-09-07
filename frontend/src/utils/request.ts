import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '@/types';

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加JWT token
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    
    // 如果后端返回的数据结构包含success字段
    if (data && typeof data.success === 'boolean') {
      if (data.success) {
        return data;
      } else {
        message.error(data.message || '请求失败');
        return Promise.reject(new Error(data.message || '请求失败'));
      }
    }
    
    // 直接返回数据
    return data;
  },
  (error: AxiosError<ApiResponse>) => {
    console.error('Response error:', error);
    
    // 网络错误
    if (!error.response) {
      message.error('网络连接失败，请检查网络设置');
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        message.error('登录已过期，请重新登录');
        // 清除本地存储的用户信息
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        // 跳转到登录页
        window.location.href = '/login';
        break;
      case 403:
        message.error('没有权限访问此资源');
        window.location.href = '/403';
        break;
      case 404:
        message.error('请求的资源不存在');
        break;
      case 500:
        message.error('服务器内部错误');
        break;
      default:
        message.error(data?.message || `请求失败 (${status})`);
    }
    
    return Promise.reject(error);
  }
);

export default request;