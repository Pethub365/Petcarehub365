import axiosClient from './axiosClient';

const userApi = {
  updateProfile: (data: any) => {
    const isFormData = data instanceof FormData;
    return axiosClient.put('/users/profile', data, isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : undefined);
  },
  getProfile: () => axiosClient.get('/users/profile'),
};

export default userApi;
