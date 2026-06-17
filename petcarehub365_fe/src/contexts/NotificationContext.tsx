import React, { createContext, useContext, useState, useCallback } from 'react';
import notificationApi from '../api/notificationApi';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
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
        setUnreadCount((res.data.notifications || []).filter((n: any) => !n.isRead).length);
      }
    } catch { /* ignore */ }
  }, []);

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
