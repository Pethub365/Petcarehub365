import axiosClient from './axiosClient';

const dailyQuestApi = {
    getDailyQuests: (petId: string, date?: string) => {
        const url = `/daily-quests?pet_id=${petId}${date ? `&date=${date}` : ''}`;
        return axiosClient.get(url);
    },
    
    getQuestById: (id: string) => {
        return axiosClient.get(`/daily-quests/${id}`);
    },
    
    completeQuest: (id: string) => {
        return axiosClient.patch(`/daily-quests/${id}/complete`);
    }
};

export default dailyQuestApi;
