import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import notificationApi from '@/apis/notificationApi';

type NotificationType = 'MEAL' | 'HEALTH' | 'MISSION' | 'FAMILY' | 'ACHIEVEMENT' | 'REMINDER' | 'GENERAL';

interface RawNotification {
  _id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  ref_id?: string;
  ref_type?: string;
}

const getIconConfig = (type: string): { name: any; color: string; bg: string } => {
  const t = (type || '').toUpperCase();
  switch (t) {
    case 'MEAL':
    case 'NUTRITION':
      return { name: 'restaurant', color: '#FF9F43', bg: '#FFF6E9' };
    case 'HEALTH':
    case 'VACCINE':
    case 'MEDICAL':
      return { name: 'medkit', color: '#4DACFF', bg: '#E1F0FF' };
    case 'MISSION':
    case 'QUEST':
    case 'DAILY_ROUTINE':
      return { name: 'rocket', color: '#EC4B4B', bg: '#FFF0F0' };
    case 'FAMILY':
      return { name: 'people', color: '#27AE60', bg: '#E2FBE9' };
    case 'ACHIEVEMENT':
    case 'BADGE':
      return { name: 'trophy', color: '#FFC529', bg: '#FFF9E6' };
    case 'REMINDER':
    case 'SCHEDULE':
      return { name: 'calendar', color: '#C462FF', bg: '#F3E8FF' };
    case 'PROMOTION':
    case 'ORDER':
      return { name: 'bag', color: '#EC4B4B', bg: '#FFF0F0' };
    default:
      return { name: 'notifications', color: '#8A9AA9', bg: '#F1F3F5' };
  }
};

const formatRelativeTime = (dateStr: string): string => {
  if (!dateStr) return '';
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

export default function NotificationsScreen() {
  const isDark = useColorScheme() === 'dark';
  const [notifications, setNotifications] = useState<RawNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const colors = {
    bg: isDark ? '#121212' : '#FAF9F9',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1B2530',
    subtext: isDark ? '#A0AEC0' : '#8A9AA9',
    border: isDark ? '#2D3748' : '#FFEBEB',
    unreadBg: isDark ? '#2A1A1A' : '#FFF5F5',
    unreadBorder: isDark ? '#4A2B2B' : '#FFEBEB',
    primary: '#EC4B4B',
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getNotifications({ limit: 50 }) as any;
      if (res && res.success) {
        const list: RawNotification[] = res.data?.notifications || [];
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đánh dấu đã đọc. Vui lòng thử lại.');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Xóa thông báo',
      'Bạn có chắc muốn xóa thông báo này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationApi.deleteNotification(id);
              const deleted = notifications.find(n => n._id === id);
              setNotifications(prev => prev.filter(n => n._id !== id));
              if (deleted && !deleted.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa thông báo.');
            }
          }
        }
      ]
    );
  };

  const newNotifications = notifications.filter(n => !n.is_read);
  const oldNotifications = notifications.filter(n => n.is_read);

  const renderCard = (noti: RawNotification, isUnread: boolean) => {
    const icon = getIconConfig(noti.type);
    return (
      <TouchableOpacity
        key={noti._id}
        style={[
          styles.notiCard,
          {
            backgroundColor: isUnread ? colors.unreadBg : colors.card,
            borderColor: isUnread ? colors.unreadBorder : colors.border,
          }
        ]}
        onPress={() => {
          if (isUnread) handleMarkRead(noti._id);
        }}
        onLongPress={() => handleDelete(noti._id)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.notiInfo}>
          <Text
            style={[
              styles.notiTitle,
              { color: isUnread ? colors.text : colors.subtext }
            ]}
            numberOfLines={1}
          >
            {noti.title}
          </Text>
          <Text
            style={[styles.notiDesc, { color: colors.subtext }]}
            numberOfLines={2}
          >
            {noti.body}
          </Text>
          <Text style={[styles.notiTime, { color: colors.subtext }]}>
            {formatRelativeTime(noti.created_at)}
          </Text>
        </View>
        {isUnread && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Thông báo</Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>Đọc hết</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 56 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.subtext }]}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* NEW SECTION */}
          {newNotifications.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>MỚI</Text>
              {newNotifications.map(noti => renderCard(noti, true))}
            </>
          )}

          {/* OLDER SECTION */}
          {oldNotifications.length > 0 && (
            <>
              <Text style={[
                styles.sectionTitle,
                { color: colors.text, marginTop: newNotifications.length > 0 ? 20 : 0 }
              ]}>
                TRƯỚC ĐÓ
              </Text>
              {oldNotifications.map(noti => renderCard(noti, false))}
            </>
          )}

          {/* Empty State */}
          {notifications.length === 0 && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Chưa có thông báo
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.subtext }]}>
                Tất cả thông báo về thú cưng, nhiệm vụ và gia đình sẽ xuất hiện ở đây.
              </Text>
            </View>
          )}

          <Text style={[styles.hint, { color: colors.subtext }]}>
            Giữ lâu để xóa thông báo
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  markAllBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  markAllText: { fontSize: 13, fontWeight: '700' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14 },

  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
    opacity: 0.6,
  },

  notiCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  notiInfo: { flex: 1 },
  notiTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  notiDesc: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  notiTime: { fontSize: 11, fontWeight: '500' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    marginLeft: 8,
    flexShrink: 0,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 30,
  },

  hint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.5,
  },
});
