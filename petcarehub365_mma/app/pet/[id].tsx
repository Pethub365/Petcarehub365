import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import petApi from '../../apis/petApi';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPet = async () => {
    if (!id) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      const res = await petApi.getPetById(String(id)) as any;
      if (res && res.success) {
        setPet(res.data.pet);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin thú cưng.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error loading pet details:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPet();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4B4B" />
      </View>
    );
  }

  const currentLevel = pet?.stats?.level || 1;
  const currentXp = pet?.stats?.xp || 0;
  const xpNeeded = currentLevel * 100 + 800; // Formula matching pets.tsx
  const remainingXp = xpNeeded - currentXp;

  const moodPercent = pet?.stats?.mood !== undefined ? pet.stats.mood : 75;
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1B2530" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Profile</Text>
        <TouchableOpacity onPress={() => Alert.alert('Thông tin', 'Chỉnh sửa thông tin thú cưng')} style={styles.gearBtn}>
          <Ionicons name="settings-sharp" size={22} color="#1B2530" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pet Avatar and Title */}
        <View style={styles.petHeroSection}>
          <View style={styles.avatarOutlineRing}>
            <View style={styles.avatarImageContainer}>
              {pet?.avatar_url ? (
                <Image source={{ uri: pet.avatar_url }} style={styles.petImage} />
              ) : (
                <View style={styles.pawPlaceholder}>
                  <Ionicons name="paw" size={60} color="#FCD7D7" />
                </View>
              )}
            </View>
          </View>
          <Text style={styles.petName}>{pet?.name || 'Rudy'}</Text>
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
          <TouchableOpacity onPress={() => Alert.alert('Thành tựu', 'Xem toàn bộ danh sách thành tựu')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
          <View style={styles.achievementCard}>
            <View style={[styles.achievementIconCircle, { backgroundColor: '#E2FBE9' }]}>
              <Ionicons name="home" size={22} color="#27AE60" />
            </View>
            <Text style={styles.achievementTitle}>New Home</Text>
            <Text style={styles.achievementDesc}>Welcome home, Buddy!</Text>
          </View>

          <View style={styles.achievementCard}>
            <View style={[styles.achievementIconCircle, { backgroundColor: '#E2F5FF' }]}>
              <Ionicons name="walk" size={22} color="#2D9CDB" />
            </View>
            <Text style={styles.achievementTitle}>Explorer</Text>
            <Text style={styles.achievementDesc}>Lần đầu dắt pet đi dạo</Text>
          </View>

          <View style={styles.achievementCard}>
            <View style={[styles.achievementIconCircle, { backgroundColor: '#FFF7E6' }]}>
              <Ionicons name="trophy" size={22} color="#F2994A" />
            </View>
            <Text style={styles.achievementTitle}>Champion</Text>
            <Text style={styles.achievementDesc}>Đạt cấp độ 5</Text>
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B2530' },
  gearBtn: { padding: 4 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF9F9' },
  
  petHeroSection: { alignItems: 'center', marginVertical: 16 },
  avatarOutlineRing: { width: 154, height: 154, borderRadius: 77, borderWidth: 1, borderColor: '#FFEBEB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8 },
  avatarImageContainer: { width: 140, height: 140, borderRadius: 70, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
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
  achievementCard: { width: 120, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#FFEBEB', padding: 16, alignItems: 'center' },
  achievementIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  achievementTitle: { fontSize: 13, fontWeight: 'bold', color: '#1B2530', marginBottom: 4 },
  achievementDesc: { fontSize: 10, color: '#8A9AA9', fontWeight: '600', textAlign: 'center', lineHeight: 14 },

  missionBtn: { flexDirection: 'row', backgroundColor: '#EC4B4B', borderRadius: 28, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, shadowColor: '#EC4B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  missionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rocketIcon: { marginLeft: 2 },
});
