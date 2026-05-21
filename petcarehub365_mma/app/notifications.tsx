import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Mới</Text>
        <View style={[styles.notiCard, styles.unreadCard]}>
            <View style={styles.iconWrap}><IconSymbol name="fork.knife" size={20} color="#FFA500" /></View>
            <View style={styles.notiInfo}>
                <Text style={styles.notiTitle}>Đến giờ ăn rồi!</Text>
                <Text style={styles.notiDesc}>Đã đến giờ ăn bữa tối của Mochi. Nhớ cho đủ nước nhé.</Text>
                <Text style={styles.notiTime}>Vừa xong</Text>
            </View>
            <View style={styles.unreadDot} />
        </View>

        <View style={[styles.notiCard, styles.unreadCard]}>
            <View style={[styles.iconWrap, {backgroundColor: '#E8F5E9'}]}><IconSymbol name="heart.fill" size={20} color="#4CAF50" /></View>
            <View style={styles.notiInfo}>
                <Text style={styles.notiTitle}>Cập nhật sức khỏe</Text>
                <Text style={styles.notiDesc}>Bạn cần cập nhật lịch tẩy giun định kì cho Mochi.</Text>
                <Text style={styles.notiTime}>2 giờ trước</Text>
            </View>
            <View style={styles.unreadDot} />
        </View>

        <Text style={styles.sectionTitle}>Trước đó</Text>
        <View style={styles.notiCard}>
            <View style={[styles.iconWrap, {backgroundColor: '#FFEBEE'}]}><IconSymbol name="star.fill" size={20} color="#FF4D4D" /></View>
            <View style={styles.notiInfo}>
                <Text style={styles.notiTitle}>Hoàn thành nhiệm vụ!</Text>
                <Text style={styles.notiDesc}>Bạn nhận được 50 XP từ nhiệm vụ Đi dạo.</Text>
                <Text style={styles.notiTime}>Hôm qua</Text>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12, marginTop: 10 },
  
  notiCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0', alignItems: 'flex-start' },
  unreadCard: { borderColor: '#FFEBEB', backgroundColor: '#FFF5F5' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  notiInfo: { flex: 1 },
  notiTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  notiDesc: { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 6 },
  notiTime: { fontSize: 11, color: '#999' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4D', marginTop: 4 },
});
