import axiosClient from './axiosClient';

const dailyQuestApi = {
  getDailyQuests: (petId: string, date?: string) =>
    axiosClient.get(`/daily-quests?pet_id=${petId}${date ? `&date=${date}` : ''}`),
  getQuestById: (id: string) => axiosClient.get(`/daily-quests/${id}`),
  completeQuest: (id: string) => axiosClient.patch(`/daily-quests/${id}/complete`),
  getWeeklyQuests: (petId: string, period: 'WEEKLY' | 'MONTHLY' | 'ANNUAL', date?: string) =>
    axiosClient.get(`/weekly-quests?pet_id=${petId}&period=${period}${date ? `&date=${date}` : ''}`),
  getWeeklyQuestById: (id: string) => axiosClient.get(`/weekly-quests/${id}`),
  completeWeeklyQuest: (id: string) => axiosClient.patch(`/weekly-quests/${id}/complete`),
};

export default dailyQuestApi;
