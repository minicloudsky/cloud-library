import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Login';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import BookManage from './pages/Books/BookManage';
import MyBorrowRecords from './pages/Borrow/MyBorrowRecords';
import AllBorrowRecords from './pages/Borrow/AllBorrowRecords';
import UserManage from './pages/Users/UserManage';
import { isAuthenticated } from './utils/auth';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Navigate to="/books" replace />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BookManage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrow/my-records"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MyBorrowRecords />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrow/all-records"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AllBorrowRecords />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserManage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              isAuthenticated() ? <Navigate to="/books" replace /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;