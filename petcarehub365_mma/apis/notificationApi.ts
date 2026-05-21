import axiosClient from './axiosClient';

const notificationApi = {
    getNotifications: (params = {}) => axiosClient.get('/notifications', { params }),
    getUnreadCount: () => axiosClient.get('/notifications/unread-count'),
    markAllAsRead: () => axiosClient.put('/notifications/read-all'),
    markAsRead: (id: string) => axiosClient.put(`/notifications/${id}/read`),
    deleteNotification: (id: string) => axiosClient.delete(`/notifications/${id}`),
};

export default notificationApi;
