import axiosClient from './axiosClient';

const authApi = {
    register: (data: any) => axiosClient.post('/auth/register', data),
    login: (data: any) => axiosClient.post('/auth/login', data),
    verifyOtp: (data: any) => axiosClient.post('/auth/verify-otp', data),
    logout: () => axiosClient.post('/auth/logout', {}),
    forgotPassword: (email: string) => axiosClient.post('/auth/forgot-password', { email }),
    resetPassword: (data: any) => axiosClient.post('/auth/reset-password', data),
    getMe: () => axiosClient.get('/auth/me'),
    changePassword: (data: any) => axiosClient.post('/auth/change-password', data),
    refreshTokens: (refreshToken: string) => axiosClient.post('/auth/refresh', { refreshToken }),
};

export default authApi;
