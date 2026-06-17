import React, { createContext, useState, useEffect, useContext } from 'react';
import authApi from '../api/authApi';
import userApi from '../api/userApi';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<any>;
  register: (data: any) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (data: any) => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
  changePassword: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokensRaw = localStorage.getItem('tokens');
        const userRaw = localStorage.getItem('user');
        if (tokensRaw && userRaw) {
          const tokens = JSON.parse(tokensRaw);
          const hasValidToken = tokens?.access?.token && tokens?.refresh?.token;
          if (!hasValidToken) {
            localStorage.removeItem('tokens');
            localStorage.removeItem('user');
            setLoading(false);
            return;
          }
          setUser(JSON.parse(userRaw));
          setIsAuthenticated(true);
          try {
            const res = await authApi.getMe() as any;
            if (res?.success) {
              setUser(res.data.user);
              localStorage.setItem('user', JSON.stringify(res.data.user));
            }
          } catch (err: any) {
            const status = err.response?.status;
            if (status === 401 || status === 403) {
              localStorage.removeItem('tokens');
              localStorage.removeItem('user');
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (identifier: string, password: string, rememberMe = true) => {
    try {
      const res = await authApi.login({ identifier, password, rememberMe }) as any;
      if (res?.success) {
        if (res.data.requiresOtp === false && res.data.user && res.data.tokens) {
          localStorage.setItem('tokens', JSON.stringify(res.data.tokens));
          localStorage.setItem('user', JSON.stringify(res.data.user));
          setUser(res.data.user);
          setIsAuthenticated(true);
          return { success: true, requiresOtp: false };
        }
        return { success: true, requiresOtp: true };
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      return { success: false, message: msg || 'Đăng nhập thất bại' };
    }
  };

  const register = async (data: any) => {
    try {
      return await authApi.register(data);
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.error?.message || err.response?.data?.message || 'Đăng ký thất bại',
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      return await authApi.forgotPassword(email);
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Gửi email thất bại' };
    }
  };

  const resetPassword = async (data: any) => {
    try {
      return await authApi.resetPassword(data);
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.error?.message || 'Đặt lại mật khẩu thất bại',
      };
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const res = await userApi.updateProfile(data) as any;
      if (res?.success) {
        const meRes = await authApi.getMe() as any;
        if (meRes?.success) {
          setUser(meRes.data.user);
          localStorage.setItem('user', JSON.stringify(meRes.data.user));
        }
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, message: err.response?.data?.error?.message || 'Cập nhật thất bại' };
    }
  };

  const changePassword = async (data: any) => {
    try {
      return await authApi.changePassword(data);
    } catch (err: any) {
      return { success: false, message: err.response?.data?.error?.message || 'Đổi mật khẩu thất bại' };
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe() as any;
      if (res?.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch { /* ignore */ }
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, loading,
      login, register, forgotPassword, resetPassword,
      updateProfile, changePassword, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
