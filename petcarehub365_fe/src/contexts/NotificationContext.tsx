import React, { createContext, useContext, useState, useCallback } from 'react';
import notificationApi from '../api/notificationApi';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getNotifications() as any;
      if (res?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount((res.data.notifications || []).filter((n: any) => !(n.isRead || n.is_read)).length);
      }
    } catch { /* ignore */ }
  }, []);

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAllRead, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
