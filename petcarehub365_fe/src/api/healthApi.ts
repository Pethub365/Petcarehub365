import axiosClient from './axiosClient';

const healthApi = {
  getHealthRecords: (petId: string) => axiosClient.get(`/health-records?pet_id=${petId}`),
  createHealthRecord: (data: any) => axiosClient.post('/health-records', data),
  updateHealthRecord: (id: string, data: any) => axiosClient.put(`/health-records/${id}`, data),
  deleteHealthRecord: (id: string) => axiosClient.delete(`/health-records/${id}`),
};

export default healthApi;
