import axiosClient from './axiosClient';

const healthApi = {
  getLogs: (petId: string) => axiosClient.get(`/pet-health/${petId}/logs`),
  addLog: (petId: string, data: { weight: number; height: number; heart_rate?: number; temperature?: number; measured_at?: string }) => 
    axiosClient.post(`/pet-health/${petId}/logs`, data),
  getVaccines: (petId: string) => axiosClient.get(`/pet-health/${petId}/vaccines`),
  addVaccine: (petId: string, data: { vaccine_name: string; administered_date: string; next_due_date?: string; notes?: string }) => 
    axiosClient.post(`/pet-health/${petId}/vaccines`, data),
};

export default healthApi;
