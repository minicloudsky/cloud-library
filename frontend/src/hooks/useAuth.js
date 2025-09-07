import { useState, useEffect, createContext, useContext } from 'react';
import { message } from 'antd';
import { userAPI } from '../services/api';

// 创建认证上下文
const AuthContext = createContext();

// 权限常量
export const PERMISSIONS = {
  BORROW_BOOK: 'BORROW_BOOK',
  RETURN_BOOK: 'RETURN_BOOK',
  MANAGE_BOOK: 'MANAGE_BOOK',
  MANAGE_USER: 'MANAGE_USER',
  ADMIN_OPERATION: 'ADMIN_OPERATION'
};

// 用户角色常量
export const USER_ROLES = {
  STUDENT: { code: 1, name: '学生' },
  TEACHER: { code: 2, name: '老师' },
  ADMIN: { code: 3, name: '管理员' }
};

// AuthProvider组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  // 初始化用户信息
  useEffect(() => {
    const initUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('userInfo');
        
        if (token && userInfo) {
          const userData = JSON.parse(userInfo);
          setUser(userData);
          
          // 获取用户权限
          await fetchUserPermissions(userData.id);
        }
      } catch (error) {
        console.error('初始化用户信息失败:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  // 获取用户权限
  const fetchUserPermissions = async (userId) => {
    try {
      const permissionKeys = Object.values(PERMISSIONS);
      const permissionPromises = permissionKeys.map(permission =>
        userAPI.hasPermission(userId, permission)
      );
      
      const results = await Promise.all(permissionPromises);
      const userPermissions = permissionKeys.filter((_, index) => results[index].data);
      setPermissions(userPermissions);
    } catch (error) {
      console.error('获取用户权限失败:', error);
      setPermissions([]);
    }
  };

  // 登录
  const login = async (loginData) => {
    try {
      const response = await userAPI.login(loginData);
      const { data: token } = response;
      
      // 存储token
      localStorage.setItem('token', token);
      
      // 获取用户信息
      const userInfoResponse = await userAPI.getUserInfo(1); // 这里应该解析token获取userId
      const userData = userInfoResponse.data;
      
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setUser(userData);
      
      // 获取用户权限
      await fetchUserPermissions(userData.id);
      
      message.success('登录成功');
      return { success: true };
    } catch (error) {
      message.error(error.message || '登录失败');
      return { success: false, error: error.message };
    }
  };

  // 注册
  const register = async (registerData) => {
    try {
      await userAPI.register(registerData);
      message.success('注册成功，请登录');
      return { success: true };
    } catch (error) {
      message.error(error.message || '注册失败');
      return { success: false, error: error.message };
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
    setPermissions([]);
    message.success('已退出登录');
  };

  // 检查权限
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  // 检查角色
  const hasRole = (role) => {
    return user?.role?.code === role;
  };

  // 是否为管理员
  const isAdmin = () => {
    return hasRole(USER_ROLES.ADMIN.code);
  };

  // 是否为老师或管理员
  const isTeacherOrAdmin = () => {
    return hasRole(USER_ROLES.TEACHER.code) || hasRole(USER_ROLES.ADMIN.code);
  };

  const value = {
    user,
    loading,
    permissions,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
    isAdmin,
    isTeacherOrAdmin,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};