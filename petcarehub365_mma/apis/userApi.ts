import axiosClient from './axiosClient';

const userApi = {
    getProfile: () => axiosClient.get('/users/profile'),
    updateProfile: (data: any) =>
        axiosClient.put('/users/profile', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};

export default userApi;
