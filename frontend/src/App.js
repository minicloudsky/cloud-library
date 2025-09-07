import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import BookBrowse from './pages/Books/BookBrowse';
import BookManage from './pages/Books/BookManage';
import MyBorrowRecords from './pages/Borrow/MyBorrowRecords';
import AllBorrowRecords from './pages/Borrow/AllBorrowRecords';
import UserManage from './pages/Users/UserManage';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';

import { USER_ROLES } from './hooks/useAuth';
import './App.css';

// 设置dayjs为中文
dayjs.locale('zh-cn');

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* 登录页面 */}
              <Route path="/login" element={<Login />} />
              
              {/* 主要应用路由 */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                {/* 首页 */}
                <Route index element={<Home />} />
                
                {/* 图书相关路由 */}
                <Route path="books">
                  <Route path="browse" element={<BookBrowse />} />
                  <Route
                    path="manage"
                    element={
                      <ProtectedRoute requiredRole={USER_ROLES.TEACHER.code}>
                        <BookManage />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                
                {/* 借阅相关路由 */}
                <Route path="borrow">
                  <Route path="my-records" element={<MyBorrowRecords />} />
                  <Route
                    path="all-records"
                    element={
                      <ProtectedRoute requiredRole={USER_ROLES.TEACHER.code}>
                        <AllBorrowRecords />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                
                {/* 用户管理路由 */}
                <Route
                  path="users"
                  element={
                    <ProtectedRoute requiredRole={USER_ROLES.TEACHER.code}>
                      <UserManage />
                    </ProtectedRoute>
                  }
                />
              </Route>
              
              {/* 错误页面 */}
              <Route path="/403" element={<Forbidden />} />
              <Route path="/404" element={<NotFound />} />
              
              {/* 捕获所有未匹配的路由 */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;