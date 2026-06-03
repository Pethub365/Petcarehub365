import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, useColorScheme, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import achievementApi from '../apis/achievementApi';
import { getStorageItem } from '../utils/storage';

export default function AchievementsListScreen() {
  const isDark = useColorScheme() === 'dark';
  const { petId: paramPetId } = useLocalSearchParams();

  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [petId, setPetId] = useState<string | null>(null);

  const bgColors = {
    main: '#FAF9F9',
    card: '#fff',
    text: '#1B2530',
    subtext: '#8A9AA9',
    border: '#FFEBEB',
    accentRed: '#EC4B4B',
    accentGreen: '#27AE60',
    accentGold: '#FFB000',
    goldBg: '#FFF9E6',
    goldBorder: '#FFB00033'
  };

  useFocusEffect(
    useCallback(() => {
      init();
    }, [paramPetId])
  );

  const init = async () => {
    try {
      setLoading(true);
      let activePetId = paramPetId ? String(paramPetId) : null;
      if (!activePetId) {
        activePetId = await getStorageItem('selectedPetId');
      }
      setPetId(activePetId);

      if (activePetId) {
        if (activePetId.startsWith('mock_')) {
          setMockAchievements();
        } else {
          const res = await achievementApi.getAchievements(activePetId) as any;
          if (res && res.success) {
            setAchievements(res.data.achievements || []);
          }
        }
      } else {
        setMockAchievements();
      }
    } catch (error) {
      console.error('Error fetching achievements list:', error);
      setMockAchievements();
    } finally {
      setLoading(false);
    }
  };

  const setMockAchievements = () => {
    setAchievements([
      {
        key: 'FIRST_QUEST',
        title: 'Khởi đầu tốt đẹp 🐾',
        description: 'Hoàn thành 1 nhiệm vụ bất kỳ cho thú cưng để nhận huy hiệu Dải băng đỏ 🎗️.',
        required_count: 1,
        current_count: 1,
        is_unlocked: true,
        badge_icon: 'ribbon',
        badge_color: '#EC4B4B',
        badge_bg_color: '#FFF0F0',
        reward_xp: 50,
        reward_coin: 20
      },
      {
        key: 'FEED_MORNING_5',
        title: 'Bữa sáng đầy đủ ☀️',
        description: 'Cho thú cưng ăn bữa sáng dinh dưỡng 5 lần để nhận huy hiệu Bát ăn vàng 🍳.',
        required_count: 5,
        current_count: 3,
        is_unlocked: false,
        badge_icon: 'restaurant',
        badge_color: '#FFB000',
        badge_bg_color: '#FFF9E6',
        reward_xp: 100,
        reward_coin: 30
      },
      {
        key: 'WALK_DOG_5',
        title: 'Người bạn đồng hành 🦮',
        description: 'Hoàn thành 5 nhiệm vụ dắt chó đi dạo để nhận huy hiệu Bước chân xanh 🦮.',
        required_count: 5,
        current_count: 5,
        is_unlocked: true,
        badge_icon: 'walk',
        badge_color: '#2F80ED',
        badge_bg_color: '#E2F0FF',
        reward_xp: 100,
        reward_coin: 30
      },
      {
        key: 'ALL_QUESTS_10',
        title: 'Chăm sóc bền bỉ 🌟',
        description: 'Hoàn thành 10 nhiệm vụ bất kỳ cho thú cưng để nhận huy hiệu Ngôi sao xanh 🌟.',
        required_count: 10,
        current_count: 8,
        is_unlocked: false,
        badge_icon: 'star',
        badge_color: '#3498DB',
        badge_bg_color: '#EBF5FB',
        reward_xp: 150,
        reward_coin: 50
      }
    ]);
  };

  const getFilteredAchievements = () => {
    switch (activeTab) {
      case 'unlocked':
        return achievements.filter(ach => ach.is_unlocked);
      case 'locked':
        return achievements.filter(ach => !ach.is_unlocked);
      default:
        return achievements;
    }
  };

  const renderAchievementCard = ({ item }: { item: any }) => {
    const isUnlocked = !!item.is_unlocked;
    const progressPercent = Math.min(100, Math.max(0, (item.current_count / item.required_count) * 100));

    return (
      <View style={[styles.card, !isUnlocked && styles.lockedCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.badgeContainer, { backgroundColor: item.badge_bg_color || '#FFF0F0' }]}>
            <Ionicons name={item.badge_icon || 'ribbon'} size={32} color={item.badge_color || '#EC4B4B'} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.achTitle}>{item.title}</Text>
            <View style={styles.rewardsRow}>
              <View style={styles.rewardTag}>
                <Ionicons name="star" size={12} color={bgColors.accentGreen} style={{ marginRight: 3 }} />
                <Text style={styles.rewardText}>+{item.reward_xp} XP</Text>
              </View>
              <View style={[styles.rewardTag, { backgroundColor: bgColors.goldBg }]}>
                <Ionicons name="cash" size={12} color={bgColors.accentGold} style={{ marginRight: 3 }} />
                <Text style={[styles.rewardText, { color: bgColors.accentGold }]}>+{item.reward_coin} Coins</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.achDesc}>{item.description}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>
              {isUnlocked ? 'Thành tựu đã mở khóa 🎉' : 'Tiến trình hoàn thành'}
            </Text>
            <Text style={[styles.progressVal, isUnlocked && { color: bgColors.accentGreen }]}>
              {item.current_count}/{item.required_count}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercent}%` },
                isUnlocked ? { backgroundColor: bgColors.accentGreen } : { backgroundColor: item.badge_color || bgColors.accentRed }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColors.main }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={bgColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: bgColors.text }]}>Danh hiệu & Thành tựu</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['all', 'unlocked', 'locked'] as const).map((tab) => {
          const isActive = activeTab === tab;
          let label = 'Tất cả';
          if (tab === 'unlocked') label = 'Đã đạt';
          else if (tab === 'locked') label = 'Chưa đạt';

          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={bgColors.accentRed} />
        </View>
      ) : (
        <FlatList
          data={getFilteredAchievements()}
          keyExtractor={(item) => item.key}
          renderItem={renderAchievementCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={48} color={bgColors.subtext} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>Không tìm thấy thành tựu nào.</Text>
            </View>
          }
        />
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
    paddingVertical: 16, 
    backgroundColor: '#fff',
    borderBottomWidth: 1, 
    borderBottomColor: '#FFEBEB' 
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#FFEBEB',
    paddingBottom: 4,
  },
  tabBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#EC4B4B',
  },
  tabBtnText: {
    fontSize: 14,
    color: '#8A9AA9',
    fontWeight: 'bold',
  },
  tabBtnTextActive: {
    color: '#EC4B4B',
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, gap: 16 },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFEBEB',
    padding: 20,
    shadowColor: '#EC4B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  lockedCard: {
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  achTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B2530',
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rewardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  achDesc: {
    fontSize: 13,
    color: '#5A6E82',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  progressSection: {
    gap: 8,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#8A9AA9',
    fontWeight: 'bold',
  },
  progressVal: {
    fontSize: 12,
    color: '#1B2530',
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#FFF0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#8A9AA9',
    fontWeight: 'bold',
  }
});
