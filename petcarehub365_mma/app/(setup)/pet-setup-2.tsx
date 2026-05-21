import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PetSetup2Screen() {
  const [activity, setActivity] = useState('Bình thường');
  const [feedReminder, setFeedReminder] = useState(true);
  const [walkReminder, setWalkReminder] = useState(true);
  const [vetReminder, setVetReminder] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sức khỏe & Thói quen</Text>
            <View style={{ width: 24 }} />
        </View>

        <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.activeDot]} />
        </View>
        <Text style={styles.stepText}>Step 2 of 2</Text>

        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <IconSymbol name="heart.fill" size={16} color="#FF4D4D" />
                <Text style={styles.sectionTitle}>Tình trạng sức khỏe</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.healthItem}>
                    <IconSymbol name="checkmark.circle.fill" size={24} color="#FF4D4D" />
                    <View style={styles.healthInfo}>
                        <Text style={styles.healthTitle}>Khỏe mạnh</Text>
                        <Text style={styles.healthDesc}>Đã được kiểm tra đầy đủ và cập nhật.</Text>
                    </View>
                </View>
                <View style={styles.healthDivider} />
                <View style={styles.healthItem}>
                    <IconSymbol name="phone.fill" size={24} color="#FFA500" />
                    <View style={styles.healthInfo}>
                        <Text style={styles.healthTitle}>Yêu cầu chăm sóc</Text>
                        <Text style={styles.healthDesc}>Các vấn đề nhỏ hoặc cần kiểm tra sức khoẻ định kỳ.</Text>
                    </View>
                </View>
                <View style={styles.healthDivider} />
                <View style={styles.healthItem}>
                    <IconSymbol name="cross.case.fill" size={24} color="#FF4D4D" />
                    <View style={styles.healthInfo}>
                        <Text style={styles.healthTitle}>Điều trị y tế</Text>
                        <Text style={styles.healthDesc}>Hỗ trợ y tế liên tục.</Text>
                    </View>
                </View>
            </View>
        </View>

        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <IconSymbol name="bolt.fill" size={16} color="#FF4D4D" />
                <Text style={styles.sectionTitle}>Mức độ hoạt động</Text>
            </View>
            <View style={styles.card}>
                 <View style={styles.activityRow}>
                    <TouchableOpacity onPress={() => setActivity('Chậm')} style={styles.activityItem}>
                        <IconSymbol name="leaf.fill" size={24} color={activity === 'Chậm' ? '#FF4D4D' : '#999'} />
                        <Text style={[styles.activityText, activity === 'Chậm' && styles.activityTextActive]}>Chậm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActivity('Bình thường')} style={styles.activityItem}>
                        <IconSymbol name="figure.walk" size={24} color={activity === 'Bình thường' ? '#FF4D4D' : '#999'} />
                        <Text style={[styles.activityText, activity === 'Bình thường' && styles.activityTextActive]}>Bình thường</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActivity('Cao')} style={styles.activityItem}>
                        <IconSymbol name="bolt.fill" size={24} color={activity === 'Cao' ? '#FF4D4D' : '#999'} />
                        <Text style={[styles.activityText, activity === 'Cao' && styles.activityTextActive]}>Cao</Text>
                    </TouchableOpacity>
                 </View>
            </View>
        </View>

        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <IconSymbol name="bell.fill" size={16} color="#FF4D4D" />
                <Text style={styles.sectionTitle}>Nhắc nhở mỗi ngày</Text>
            </View>
            
            <View style={styles.reminderItem}>
                <View style={styles.reminderIconWrap}><IconSymbol name="fork.knife" size={20} color="#FFA500" /></View>
                <Text style={styles.reminderTitle}>Giờ cho thú cưng ăn</Text>
                <Switch value={feedReminder} onValueChange={setFeedReminder} trackColor={{ false: '#E5E5E5', true: '#FF4D4D' }} />
            </View>

            <View style={styles.reminderItem}>
                <View style={styles.reminderIconWrap}><IconSymbol name="figure.walk" size={20} color="#4DACFF" /></View>
                <Text style={styles.reminderTitle}>Giờ dắt đi dạo</Text>
                <Switch value={walkReminder} onValueChange={setWalkReminder} trackColor={{ false: '#E5E5E5', true: '#FF4D4D' }} />
            </View>

            <View style={styles.reminderItem}>
                <View style={styles.reminderIconWrap}><IconSymbol name="cross.case.fill" size={20} color="#C462FF" /></View>
                <Text style={styles.reminderTitle}>Lịch khám</Text>
                <Switch value={vetReminder} onValueChange={setVetReminder} trackColor={{ false: '#E5E5E5', true: '#FF4D4D' }} />
            </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/(setup)/ai-analyzing')}>
            <Text style={styles.buttonText}>Hoàn thành ✓</Text>
        </TouchableOpacity>
        <Text style={styles.rewardText}>+50 XP & 10 COINS REWARD</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  progressDot: { width: 24, height: 6, borderRadius: 3, backgroundColor: '#E5E5E5' },
  activeDot: { backgroundColor: '#FF4D4D' },
  stepText: { textAlign: 'center', fontSize: 12, color: '#999', marginBottom: 30 },
  
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  
  healthItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  healthInfo: { flex: 1 },
  healthTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  healthDesc: { fontSize: 12, color: '#666', lineHeight: 18 },
  healthDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 16 },
  
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  activityItem: { alignItems: 'center', gap: 8 },
  activityText: { fontSize: 12, color: '#999', fontWeight: '600' },
  activityTextActive: { color: '#FF4D4D' },

  reminderItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  reminderIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reminderTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1a1a1a' },

  button: { backgroundColor: '#FF4D4D', borderRadius: 24, paddingVertical: 18, alignItems: 'center', marginTop: 10, marginBottom: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rewardText: { textAlign: 'center', color: '#999', fontSize: 11, fontWeight: 'bold' },
});
