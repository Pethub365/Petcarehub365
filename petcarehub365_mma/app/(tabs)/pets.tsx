import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import petApi from '../../apis/petApi';
import authApi from '../../apis/authApi';
import achievementApi from '../../apis/achievementApi';
import { getStorageItem } from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';

export default function PetsScreen() {
  const { user: authUser } = useAuth();
  const [pet, setPet] = useState<any | null>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(authUser);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Load thông tin thú cưng và người dùng hiện tại
  const loadPetData = async () => {
    try {
      setLoading(true);
      
      // Load user profile mới nhất
      const uRes = await authApi.getMe() as any;
      if (uRes && uRes.success) {
        setUser(uRes.data.user);
      }

      // Load all pets list
      const petsListRes = await petApi.getPets() as any;
      let petList = [];
      if (petsListRes && petsListRes.success) {
        petList = petsListRes.data.pets || [];
        setPets(petList);
      }

      // Load pet hiện đang chọn
      const selectedPetId = await getStorageItem('selectedPetId');
      let currentPetId = selectedPetId;
      if (selectedPetId) {
        const foundPet = petList.find((p: any) => p._id === selectedPetId);
        if (foundPet) {
          setPet(foundPet);
        } else if (petList.length > 0) {
          setPet(petList[0]);
          currentPetId = petList[0]._id;
          await require('../../utils/storage').setStorageItem('selectedPetId', petList[0]._id);
        } else {
          setPet(null);
        }
      } else if (petList.length > 0) {
        const firstPet = petList[0];
        setPet(firstPet);
        currentPetId = firstPet._id;
        await require('../../utils/storage').setStorageItem('selectedPetId', firstPet._id);
      } else {
        setPet(null);
      }

      // Load achievements
      if (currentPetId && !currentPetId.startsWith('mock_')) {
        const aRes = await achievementApi.getAchievements(currentPetId) as any;
        if (aRes && aRes.success) {
          setAchievements(aRes.data.achievements || []);
        }
      } else {
        // Mock achievements for mock pets
        setAchievements([
          {
            key: 'FIRST_QUEST',
            title: 'Khởi đầu tốt đẹp 🐾',
            description: 'Hoàn thành 1 nhiệm vụ bất kỳ cho thú cưng để nhận huy hiệu Dải băng đỏ 🎗️.',
            badge_icon: 'ribbon',
            badge_color: '#EC4B4B',
            badge_bg_color: '#FFF0F0',
            is_unlocked: true,
            current_count: 1,
            required_count: 1
          },
          {
            key: 'FEED_MORNING_5',
            title: 'Bữa sáng đầy đủ ☀️',
            description: 'Cho thú cưng ăn bữa sáng dinh dưỡng 5 lần để nhận huy hiệu Bát ăn vàng 🍳.',
            badge_icon: 'restaurant',
            badge_color: '#FFB000',
            badge_bg_color: '#FFF9E6',
            is_unlocked: false,
            current_count: 2,
            required_count: 5
          },
          {
            key: 'WALK_DOG_5',
            title: 'Người bạn đồng hành 🦮',
            description: 'Hoàn thành 5 nhiệm vụ dắt chó đi dạo để nhận huy hiệu Bước chân xanh 🦮.',
            badge_icon: 'walk',
            badge_color: '#2F80ED',
            badge_bg_color: '#E2F0FF',
            is_unlocked: false,
            current_count: 1,
            required_count: 5
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading pet detail screen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPet = async (selected: any) => {
    setPet(selected);
    await require('../../utils/storage').setStorageItem('selectedPetId', selected._id);
    try {
      setLoading(true);
      if (selected._id && !selected._id.startsWith('mock_')) {
        const aRes = await achievementApi.getAchievements(selected._id) as any;
        if (aRes && aRes.success) {
          setAchievements(aRes.data.achievements || []);
        }
      }
    } catch (error) {
      console.error('Error switching pet:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPetData();
    }, [])
  );

  if (loading && !pet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4B4B" />
      </View>
    );
  }

  // Fallback to Rudy mockup pet if none exists to align with Figma design
  const displayPet = pet || {
    name: 'Rudy',
    species: 'DOG',
    breed: 'Golden Retriever',
    avatar_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=200',
    stats: {
      level: 1,
      xp: 180,
      mood: 75
    }
  };

  const currentLevel = displayPet?.stats?.level || 1;
  const currentXp = displayPet?.stats?.xp || 0;
  const xpNeeded = currentLevel * 100 + 800;
  const remainingXp = xpNeeded - currentXp;

  const moodPercent = displayPet?.stats?.mood !== undefined ? displayPet.stats.mood : 75;
  const getMoodLabel = (m: number) => {
    if (m >= 80) return 'Very Happy';
    if (m >= 60) return 'Happy';
    if (m >= 40) return 'Neutral';
    return 'Sad';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => Alert.alert('Thông tin', 'Trang thông tin thú cưng')}>
          <Ionicons name="paw" size={24} color="#EC4B4B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Profile</Text>
        <TouchableOpacity style={styles.bellIcon} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={22} color="#1B2530" />
        </TouchableOpacity>
      </View>

      {!pet ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
            <Ionicons name="paw-outline" size={80} color="#FFEBEB" style={{ marginBottom: 20 }} />
            <Text style={styles.emptyText}>Chưa có thú cưng nào được chọn</Text>
            <TouchableOpacity style={styles.setupBtn} onPress={() => router.push('/(setup)/pet-setup-1')} activeOpacity={0.8}>
                <Text style={styles.setupBtnText}>Tạo thú cưng ngay →</Text>
            </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Pet Switcher Horizontal List */}
          {pets.length > 0 && (
            <View style={styles.petSelectorContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petSelectorScroll}>
                {pets.map((p) => {
                  const isSelected = pet && pet._id === p._id;
                  return (
                    <TouchableOpacity
                      key={p._id}
                      style={styles.petSelectorItem}
                      onPress={() => handleSelectPet(p)}
                    >
                      <View style={[styles.petSelectorAvatarRing, isSelected && styles.petSelectorAvatarRingActive]}>
                        {p.avatar_url ? (
                          <Image source={{ uri: p.avatar_url }} style={styles.petSelectorAvatar} />
                        ) : (
                          <Ionicons name="paw" size={20} color={isSelected ? '#EC4B4B' : '#8A9AA9'} />
                        )}
                      </View>
                      <Text style={[styles.petSelectorName, isSelected && styles.petSelectorNameActive]} numberOfLines={1}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={styles.petSelectorItem}
                  onPress={() => router.push('/(setup)/pet-setup-1')}
                >
                  <View style={styles.petSelectorAddRing}>
                    <Ionicons name="add" size={20} color="#8A9AA9" />
                  </View>
                  <Text style={styles.petSelectorNameAdd}>Thêm mới</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* Pet Avatar and Title */}
          <View style={styles.petHeroSection}>
            <TouchableOpacity 
              onPress={() => pet?._id && router.push(`/pet/${pet._id}`)}
              activeOpacity={0.85}
              style={styles.avatarWrapper}
            >
              <View style={styles.avatarOutlineRing}>
                <View style={styles.avatarImageContainer}>
                  {displayPet?.avatar_url ? (
                    <Image source={{ uri: displayPet.avatar_url }} style={styles.petImage} />
                  ) : (
                    <View style={styles.pawPlaceholder}>
                      <Ionicons name="paw" size={60} color="#FCD7D7" />
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.avatarEditBadge}>
                <Ionicons name="create" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.petName}>{displayPet?.name}</Text>
            <Text style={styles.xpText}>{remainingXp} XP cho cấp độ tiếp theo</Text>
          </View>

          {/* Mood Meter Card */}
          <View style={styles.moodCard}>
            <View style={styles.moodHeaderRow}>
              <View style={styles.moodLeft}>
                <View style={styles.moodIconWrap}>
                  <Ionicons name="happy" size={18} color="#EC4B4B" />
                </View>
                <Text style={styles.moodTitle}>Mood Meter</Text>
              </View>
              <Text style={styles.moodValueText}>{moodPercent}% • {getMoodLabel(moodPercent)}</Text>
            </View>

            {/* Custom Slider track display */}
            <View style={styles.sliderTrackBg}>
              <View style={[styles.sliderTrackFill, { width: `${moodPercent}%` }]} />
            </View>

            <View style={styles.sliderLabelsRow}>
              <Text style={styles.sliderLabelLeft}>Buồn chán</Text>
              <Text style={styles.sliderLabelRight}>Năng lượng</Text>
            </View>
          </View>

          {/* Achievements Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Thành tựu</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/achievements-list', params: { petId: pet?._id || '' } })}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
            {achievements.length === 0 ? (
              <Text style={{ color: '#8A9AA9', paddingVertical: 20, paddingHorizontal: 10, fontSize: 13 }}>Không có thành tựu nào.</Text>
            ) : (
              achievements.map((ach) => {
                const isUnlocked = !!ach.is_unlocked;
                return (
                  <View key={ach.key} style={[styles.achievementCard, !isUnlocked && { opacity: 0.65 }]}>
                    <View style={[styles.achievementIconCircle, { backgroundColor: ach.badge_bg_color || '#FFF0F0' }]}>
                      <Ionicons name={ach.badge_icon as any || 'ribbon'} size={22} color={ach.badge_color || '#EC4B4B'} />
                    </View>
                    <Text style={styles.achievementTitle} numberOfLines={1}>{ach.title}</Text>
                    <Text style={styles.achievementDesc} numberOfLines={3}>{ach.description}</Text>
                    <Text style={[
                      styles.achievementProgressText,
                      { color: isUnlocked ? '#27AE60' : '#8A9AA9', marginTop: 6, fontSize: 10, fontWeight: 'bold' }
                    ]}>
                      {isUnlocked ? 'Đạt được ✓' : `Tiến trình: ${ach.current_count}/${ach.required_count}`}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity 
            style={styles.missionBtn} 
            onPress={() => router.push('/mission-detail')}
            activeOpacity={0.9}
          >
            <Text style={styles.missionBtnText}>Go to Daily Missions</Text>
            <Ionicons name="rocket-sharp" size={18} color="#fff" style={styles.rocketIcon} />
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#FFEBEB' },
  menuIcon: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B2530' },
  bellIcon: { padding: 4 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF9F9' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#8A9AA9', marginBottom: 20 },
  setupBtn: { backgroundColor: '#EC4B4B', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 28, shadowColor: '#EC4B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  setupBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  petHeroSection: { alignItems: 'center', marginVertical: 16 },
  avatarWrapper: { position: 'relative' },
  avatarOutlineRing: { width: 154, height: 154, borderRadius: 77, borderWidth: 1, borderColor: '#FFEBEB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8 },
  avatarImageContainer: { width: 140, height: 140, borderRadius: 70, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  avatarEditBadge: { position: 'absolute', bottom: 4, right: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: '#EC4B4B', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  petImage: { width: '140%', height: '140%', resizeMode: 'cover' },
  pawPlaceholder: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center' },
  petName: { fontSize: 24, fontWeight: 'bold', color: '#1B2530', marginTop: 12, marginBottom: 4 },
  xpText: { fontSize: 13, color: '#EC4B4B', fontWeight: 'bold', letterSpacing: 0.2 },

  moodCard: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#FFEBEB', padding: 20, marginVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.01, shadowRadius: 4 },
  moodHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  moodLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  moodIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center' },
  moodTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B2530' },
  moodValueText: { fontSize: 14, fontWeight: 'bold', color: '#EC4B4B' },
  sliderTrackBg: { height: 10, backgroundColor: '#FFF0F0', borderRadius: 5, overflow: 'hidden' },
  sliderTrackFill: { height: '100%', backgroundColor: '#EC4B4B', borderRadius: 5 },
  sliderLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sliderLabelLeft: { fontSize: 12, color: '#A5B2C0', fontWeight: 'bold' },
  sliderLabelRight: { fontSize: 12, color: '#A5B2C0', fontWeight: 'bold' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1B2530' },
  viewAllText: { fontSize: 13, fontWeight: 'bold', color: '#8A9AA9' },

  achievementsScroll: { gap: 12, paddingBottom: 4 },
  achievementCard: { width: 145, minHeight: 180, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#FFEBEB', padding: 12, alignItems: 'center' },
  achievementIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  achievementTitle: { fontSize: 13, fontWeight: 'bold', color: '#1B2530', marginBottom: 4, textAlign: 'center' },
  achievementDesc: { fontSize: 10, color: '#8A9AA9', fontWeight: '600', textAlign: 'center', lineHeight: 14, flex: 1 },
  achievementProgressText: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },

  missionBtn: { flexDirection: 'row', backgroundColor: '#EC4B4B', borderRadius: 28, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, shadowColor: '#EC4B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  missionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rocketIcon: { marginLeft: 2 },
  
  petSelectorContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEBEB',
    marginBottom: 16,
  },
  petSelectorScroll: {
    paddingHorizontal: 4,
    gap: 16,
    flexDirection: 'row',
  },
  petSelectorItem: {
    alignItems: 'center',
    width: 65,
  },
  petSelectorAvatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#E0E5EC',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
  },
  petSelectorAvatarRingActive: {
    borderColor: '#EC4B4B',
  },
  petSelectorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  petSelectorAddRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#8A9AA9',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petSelectorName: {
    fontSize: 11,
    color: '#1B2530',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  petSelectorNameActive: {
    color: '#EC4B4B',
    fontWeight: 'bold',
  },
  petSelectorNameAdd: {
    fontSize: 11,
    color: '#8A9AA9',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
});
