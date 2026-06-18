import axiosClient from './axiosClient';

const familyApi = {
  getFamilyGroup: () => axiosClient.get('/family'),
  createFamilyGroup: (groupName: string) => axiosClient.post('/family/create', { group_name: groupName }),
  inviteMember: (email: string) => axiosClient.post('/family/invite', { invited_email: email }),
  joinFamily: (inviteCode: string) => axiosClient.post('/family/join', { inviteCode }),
  getPendingInvitations: () => axiosClient.get('/family/invitations/pending'),
  getSentInvitations: () => axiosClient.get('/family/invitations/sent'),
  removeMember: (memberUserId: string) => axiosClient.delete(`/family/members/${memberUserId}`),
};

export default familyApi;
