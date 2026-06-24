import axiosClient from './axiosClient';

const adminApi = {
  getStats: (params?: { page?: number; limit?: number }) => axiosClient.get('/admin/stats', { params }),
};

export default adminApi;
