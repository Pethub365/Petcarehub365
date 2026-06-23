import axiosClient from './axiosClient';

const achievementApi = {
  getAchievements: (petId?: string) => axiosClient.get(`/achievements${petId ? `?pet_id=${petId}` : ''}`),
};

export default achievementApi;
