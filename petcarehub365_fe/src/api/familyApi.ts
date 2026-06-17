import axiosClient from './axiosClient';

const familyApi = {
  getFamilyMembers: () => axiosClient.get('/family'),
  inviteMember: (email: string) => axiosClient.post('/family/invite', { email }),
  removeMember: (memberId: string) => axiosClient.delete(`/family/${memberId}`),
  acceptInvite: (token: string) => axiosClient.post('/family/accept', { token }),
};

export default familyApi;
