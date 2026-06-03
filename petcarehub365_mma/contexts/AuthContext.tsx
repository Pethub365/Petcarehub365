// @ts-nocheck
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';
import authApi from '../apis/authApi';
import userApi from '../apis/userApi';

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedTokensStr = await getStorageItem('tokens');
                const storedUserStr = await getStorageItem('user');

                if (storedTokensStr && storedUserStr && storedTokensStr !== 'undefined' && storedUserStr !== 'undefined') {
                    // Kiểm tra xem token có hợp lệ không bằng cách parse và check structure
                    const tokens = JSON.parse(storedTokensStr);
                    const hasValidToken = tokens?.access?.token && tokens?.refresh?.token;

                    if (!hasValidToken) {
                        // Token cũ không hợp lệ (dummy token từ bypass) → xóa sạch
                        await removeStorageItem('tokens');
                        await removeStorageItem('user');
                        setLoading(false);
                        return;
                    }

                    setUser(JSON.parse(storedUserStr));
                    setIsAuthenticated(true);

                    try {
                        const response = await authApi.getMe();
                        if (response && (response as any).success) {
                            setUser((response as any).data.user);
                            await setStorageItem('user', JSON.stringify((response as any).data.user));
                        }
                    } catch (error: any) {
                        // Chỉ đăng xuất nếu là lỗi xác thực (401 hoặc 403) từ server
                        const status = error.response?.status;
                        if (status === 401 || status === 403) {
                            console.warn("Session expired, clearing storage");
                            await removeStorageItem('tokens');
                            await removeStorageItem('user');
                            setUser(null);
                            setIsAuthenticated(false);
                        } else {
                            // Lỗi mạng hoặc server không phản hồi thì giữ nguyên trạng thái đăng nhập
                            console.log("Network error or server unreachable, keeping offline session");
                        }
                    }
                }
            } catch (err) {
                console.error("Error reading from storage during init", err);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (identifier: string, password: string, rememberMe = true) => {
        try {
            const response = await authApi.login({ identifier, password, rememberMe }) as any;
            if (response && response.success) {
                if (response.data.requiresOtp === false && response.data.user && response.data.tokens) {
                    const { user, tokens } = response.data;
                    await setStorageItem('tokens', JSON.stringify(tokens));
                    await setStorageItem('user', JSON.stringify(user));
                    setUser(user);
                    setIsAuthenticated(true);
                    return { success: true, requiresOtp: false };
                }
                return { success: true, requiresOtp: true };
            }
        } catch (error: any) {
            const status = error.response?.status;
            const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
            console.error(`Login Error [${status}]:`, msg);
            return {
                success: false,
                message: msg || 'Đăng nhập thất bại'
            };
        }
    };

    const register = async (data: any) => {
        try {
            const response = await authApi.register(data);
            return response;
        } catch (error: any) {
            console.error("Register Error:", error);
            return {
                success: false,
                message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Đăng ký thất bại'
            };
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            const response = await authApi.forgotPassword(email);
            return response;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Gửi email thất bại'
            };
        }
    };

    const resetPassword = async (data: { email: string, otp: string, newPassword: string }) => {
        try {
            const response = await authApi.resetPassword(data);
            return response;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.error?.message || error.response?.data?.message || 'Đặt lại mật khẩu thất bại'
            };
        }
    };

    const updateProfile = async (data: any) => {
        try {
            const response = await userApi.updateProfile(data) as any;
            if (response && response.success) {
                const meRes = await authApi.getMe() as any;
                if (meRes && meRes.success) {
                    setUser(meRes.data.user);
                    await setStorageItem('user', JSON.stringify(meRes.data.user));
                }
                return { success: true };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.error?.message || 'Cập nhật thất bại'
            };
        }
    };

    const changePassword = async (data: { oldPassword: string, newPassword: string }) => {
        try {
            const response = await authApi.changePassword(data);
            return response;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.error?.message || 'Đổi mật khẩu thất bại'
            };
        }
    };

    const refreshUser = async () => {
        try {
            const response = await authApi.getMe() as any;
            if (response && response.success) {
                setUser(response.data.user);
                await setStorageItem('user', JSON.stringify(response.data.user));
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout API error', error);
        }
        await removeStorageItem('tokens');
        await removeStorageItem('user');
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
