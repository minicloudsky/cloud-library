import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { message } from 'antd';
import { userAPI } from '@/services/api';
import type { User, LoginRequest, RegisterRequest, UserRoleCode, Permission } from '@/types';

// 创建认证上下文
interface AuthContextType {
  user: User | null;
  loading: boolean;
  permissions: Permission[];
  login: (loginData: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (registerData: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRoleCode) => boolean;
  isAdmin: () => boolean;
  isTeacherOrAdmin: () => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 权限常量
export const PERMISSIONS = {
  BORROW_BOOK: 'BORROW_BOOK' as Permission,
  RETURN_BOOK: 'RETURN_BOOK' as Permission,
  MANAGE_BOOK: 'MANAGE_BOOK' as Permission,
  MANAGE_USER: 'MANAGE_USER' as Permission,
  ADMIN_OPERATION: 'ADMIN_OPERATION' as Permission,
};

// 用户角色常量
export const USER_ROLES = {
  STUDENT: { code: UserRoleCode.STUDENT, name: '学生' },
  TEACHER: { code: UserRoleCode.TEACHER, name: '老师' },
  ADMIN: { code: UserRoleCode.ADMIN, name: '管理员' },
} as const;

// AuthProvider组件
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // 初始化用户信息
  useEffect(() => {
    const initUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('userInfo');
        
        if (token && userInfo) {
          const userData = JSON.parse(userInfo) as User;
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
  const fetchUserPermissions = async (userId: number) => {
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
  const login = async (loginData: LoginRequest) => {
    try {
      const response = await userAPI.login(loginData);
      const { data: token } = response;
      
      // 存储token
      localStorage.setItem('token', token);
      
      // 获取用户信息 - 这里需要根据实际API调整
      // 应该从token中解析用户ID，或者使用专门的获取当前用户信息接口
      const userInfoResponse = await userAPI.getUserInfo(1); // 临时使用固定ID
      const userData = userInfoResponse.data;
      
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setUser(userData);
      
      // 获取用户权限
      await fetchUserPermissions(userData.id);
      
      message.success('登录成功');
      return { success: true };
    } catch (error: any) {
      message.error(error.message || '登录失败');
      return { success: false, error: error.message };
    }
  };

  // 注册
  const register = async (registerData: RegisterRequest) => {
    try {
      await userAPI.register(registerData);
      message.success('注册成功，请登录');
      return { success: true };
    } catch (error: any) {
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
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  // 检查角色
  const hasRole = (role: UserRoleCode): boolean => {
    return user?.role?.code === role;
  };

  // 是否为管理员
  const isAdmin = (): boolean => {
    return hasRole(UserRoleCode.ADMIN);
  };

  // 是否为老师或管理员
  const isTeacherOrAdmin = (): boolean => {
    return hasRole(UserRoleCode.TEACHER) || hasRole(UserRoleCode.ADMIN);
  };

  const value: AuthContextType = {
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
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;