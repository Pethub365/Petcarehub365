import axios from 'axios';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';
import { router } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5001/api/v1';

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 10000, // Dừng chờ sau 10 giây để khỏi bị treo nút bấm
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach access token
axiosClient.interceptors.request.use(
    async (config) => {
        try {
            const tokensStr = await getStorageItem('tokens');
            if (tokensStr) {
                const tokens = JSON.parse(tokensStr);
                if (tokens && tokens.access && tokens.access.token) {
                    config.headers.Authorization = `Bearer ${tokens.access.token}`;
                }
            }
        } catch (error) {
            console.error('Error reading tokens from storage:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor: handle token refresh on 401
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // KHÔNG refresh token cho các route auth (login, register, forgot-password...)
        // Vì khi login sai sẽ bị 401, interceptor không được can thiệp
        const isAuthRoute = originalRequest?.url?.includes('/auth/login')
            || originalRequest?.url?.includes('/auth/register')
            || originalRequest?.url?.includes('/auth/forgot-password')
            || originalRequest?.url?.includes('/auth/reset-password')
            || originalRequest?.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const tokensStr = await getStorageItem('tokens');
                const tokens = tokensStr ? JSON.parse(tokensStr) : null;
                const refreshToken = tokens?.refresh?.token;

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    { refreshToken },
                    { withCredentials: true }
                );

                if (response.data.success) {
                    const currentTokensStr = await getStorageItem('tokens');
                    const currentTokens = currentTokensStr ? JSON.parse(currentTokensStr) : {};
                    const newTokens = { ...currentTokens, ...response.data.data.tokens };
                    await setStorageItem('tokens', JSON.stringify(newTokens));
                    const newToken = newTokens.access.token;

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    processQueue(null, newToken);
                    return axiosClient(originalRequest);
                } else {
                    throw new Error('Refresh failed on server');
                }
            } catch (refreshError: any) {
                console.error('Token refresh failed:', refreshError);
                processQueue(refreshError, null);
                
                // Chỉ xóa session và bắt đăng nhập lại nếu server phản hồi lỗi xác thực rõ ràng (401, 403, 400)
                // Nếu là lỗi mạng (refreshError.response không tồn tại), giữ nguyên session để user không bị out
                const status = refreshError.response?.status;
                if (status === 401 || status === 403 || status === 400) {
                    await removeStorageItem('tokens');
                    await removeStorageItem('user');
                    if (router) {
                        router.replace('/login');
                    }
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
