import axiosClient from './axiosClient';

const addressApi = {
    getAddresses: () => axiosClient.get('/users/addresses'),
    getAddress: (uuid: string) => axiosClient.get(`/users/addresses/${uuid}`),
    createAddress: (data: any) => axiosClient.post('/users/addresses', data),
    updateAddress: (uuid: string, data: any) => axiosClient.put(`/users/addresses/${uuid}`, data),
    deleteAddress: (uuid: string) => axiosClient.delete(`/users/addresses/${uuid}`),
    setDefaultAddress: (uuid: string) => axiosClient.put(`/users/addresses/${uuid}/default`),
};

export default addressApi;
