import axiosClient from './axiosClient';

const notificationApi = {
  getNotifications: () => axiosClient.get('/notifications'),
  markAllRead: () => axiosClient.patch('/notifications/read-all'),
  markRead: (id: string) => axiosClient.patch(`/notifications/${id}/read`),
};

export default notificationApi;
