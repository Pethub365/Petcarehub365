import axiosClient from './axiosClient';

const userApi = {
  updateProfile: (data: any) => axiosClient.put('/users/profile', data),
  getProfile: () => axiosClient.get('/users/profile'),
};

export default userApi;
