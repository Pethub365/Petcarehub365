import axiosClient from './axiosClient';

const achievementApi = {
    getAchievements: (petId: string) => {
        return axiosClient.get(`/achievements?pet_id=${petId}`);
    }
};

export default achievementApi;
