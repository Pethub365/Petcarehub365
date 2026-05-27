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
    },

    getWeeklyQuests: (petId: string, period: 'WEEKLY' | 'MONTHLY' | 'ANNUAL', date?: string) => {
        const url = `/weekly-quests?pet_id=${petId}&period=${period}${date ? `&date=${date}` : ''}`;
        return axiosClient.get(url);
    },
    
    getWeeklyQuestById: (id: string) => {
        return axiosClient.get(`/weekly-quests/${id}`);
    },
    
    completeWeeklyQuest: (id: string) => {
        return axiosClient.patch(`/weekly-quests/${id}/complete`);
    }
};

export default dailyQuestApi;
