import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

export default function PetsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => Alert.alert('Thông tin', 'Bạn đang ở trang hồ sơ thú cưng')}>
            <IconSymbol name="paw.fill" size={24} color="#FF4D4D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PetCare Hub</Text>
        <TouchableOpacity style={styles.bellIcon} onPress={() => router.push('/notifications')}>
          <IconSymbol name="bell.fill" size={22} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.petHero}>
            <View style={styles.heroImagePlaceholder}>
               <IconSymbol name="paw.fill" size={80} color="#E5E5E5" />
            </View>
            <View style={styles.petNameRow}>
                <Text style={styles.petName}>Rudy</Text>
                <TouchableOpacity style={styles.startBtn} onPress={() => Alert.alert('Bắt đầu', 'Kích hoạt bài huấn luyện ngắn')}>
                    <Text style={styles.startBtnText}>Start</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.moodRow}>
               <IconSymbol name="face.smiling" size={16} color="#FF9800" />
               <Text style={styles.moodText}>Mood: Happy</Text>
            </View>
        </View>

        <View style={styles.profileSection}>
            <Text style={styles.sectionLabel}>My Profile</Text>
            <View style={styles.userCard}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>User1</Text>
                    <View style={styles.levelRow}>
                        <Text style={styles.levelText}>LEVEL 12</Text>
                        <Text style={styles.streakText}>🔥 7-day streak</Text>
                    </View>
                </View>
                <View style={styles.userAvatar}><IconSymbol name="person.fill" size={24} color="#fff" /></View>
            </View>
        </View>

        <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>🏆 Tiến trình hiện tại</Text>
                <Text style={styles.progressValue}>1300/2000 XP</Text>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '65%' }]} />
            </View>
            <Text style={styles.progressHint}>65% to Level 13! Giữ vững phong độ!</Text>
        </View>

        <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/mission-detail')}>
                <IconSymbol name="doc.text.fill" size={28} color="#FFA500" />
                <Text style={styles.actionTitle}>Nhiệm vụ</Text>
                <Text style={styles.actionDesc}>4/5 Done</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/health-dashboard')}>
                <IconSymbol name="heart.fill" size={28} color="#66BB6A" />
                <Text style={styles.actionTitle}>Sức khỏe</Text>
                <Text style={styles.actionDesc}>Excellent</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Vaccine', 'Rudy đã tiêm đủ vaccine theo lịch.')}>
                <IconSymbol name="syringe.fill" size={28} color="#4DACFF" />
                <Text style={styles.actionTitle}>Vaccine</Text>
                <Text style={styles.actionDesc}>Up to date</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff' },
  menuIcon: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  bellIcon: { padding: 4 },
  content: { padding: 20 },
  
  petHero: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  heroImagePlaceholder: { width: '100%', height: 180, backgroundColor: '#F8F8F8', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  petNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  petName: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  startBtn: { backgroundColor: '#FF4D4D', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moodText: { fontSize: 12, color: '#666', fontWeight: '600' },

  profileSection: { marginBottom: 24 },
  sectionLabel: { fontSize: 12, color: '#999', fontWeight: 'bold', marginBottom: 8 },
  userCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelText: { fontSize: 10, fontWeight: 'bold', color: '#999', backgroundColor: '#F0F0F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  streakText: { fontSize: 10, color: '#FF9800', fontWeight: 'bold' },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFD1D1', justifyContent: 'center', alignItems: 'center' },

  progressSection: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F0F0F0' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' },
  progressValue: { fontSize: 14, fontWeight: 'bold', color: '#999' },
  progressBarBg: { height: 8, backgroundColor: '#E5E5E5', borderRadius: 4, marginBottom: 8 },
  progressBarFill: { height: 8, backgroundColor: '#FF4D4D', borderRadius: 4 },
  progressHint: { fontSize: 11, color: '#999', textAlign: 'center' },

  actionGrid: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  actionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', marginTop: 12, marginBottom: 4 },
  actionDesc: { fontSize: 10, color: '#999', fontWeight: '600' }
});
