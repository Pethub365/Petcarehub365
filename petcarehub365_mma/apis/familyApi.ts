import axiosClient from './axiosClient';

const familyApi = {
  getFamilyGroup: () => axiosClient.get('/family'),
  createFamilyGroup: (data: { group_name: string; pet_ids?: string[] }) => 
    axiosClient.post('/family/create', data),
  inviteMember: (email: string) => 
    axiosClient.post('/family/invite', { invited_email: email }),
  joinFamily: (inviteCode: string) => 
    axiosClient.post('/family/join', { inviteCode }),
  assignQuest: (questId: string, userId: string | null) => 
    axiosClient.put(`/family/quests/${questId}/assign`, { userId }),
};

export default familyApi;
