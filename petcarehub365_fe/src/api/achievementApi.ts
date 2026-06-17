import axiosClient from './axiosClient';

const achievementApi = {
  getAchievements: () => axiosClient.get('/achievements'),
};

export default achievementApi;
