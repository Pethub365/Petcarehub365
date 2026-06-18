import axiosClient from './axiosClient';

const notificationApi = {
  getNotifications: () => axiosClient.get('/notifications'),
  markAllRead: () => axiosClient.put('/notifications/read-all'),
  markRead: (id: string) => axiosClient.put(`/notifications/${id}/read`),
};

export default notificationApi;
