import axiosClient from './axiosClient';

const healthApi = {
  getLogs: (petId: string) => axiosClient.get(`/pet-health/${petId}/logs`),
  addLog: (petId: string, data: { 
    weight: number; 
    height?: number; 
    heart_rate?: number; 
    temperature?: number; 
    measured_at?: string; 
    health_status?: string; 
    note?: string;
    food_intake?: number;
    water_intake?: number;
    sleep_duration?: number;
    activity_minutes?: number;
  }) => 
    axiosClient.post(`/pet-health/${petId}/logs`, data),
  deleteLog: (logId: string) => axiosClient.delete(`/pet-health/logs/${logId}`),

  getVaccines: (petId: string) => axiosClient.get(`/pet-health/${petId}/vaccines`),
  addVaccine: (petId: string, data: { vaccine_name: string; administered_date: string; next_due_date?: string | null; notes?: string }) => 
    axiosClient.post(`/pet-health/${petId}/vaccines`, data),
  updateVaccine: (vaccineId: string, data: { vaccine_name?: string; administered_date?: string; next_due_date?: string | null; notes?: string }) => 
    axiosClient.put(`/pet-health/vaccines/${vaccineId}`, data),
  deleteVaccine: (vaccineId: string) => axiosClient.delete(`/pet-health/vaccines/${vaccineId}`),
};

export default healthApi;
