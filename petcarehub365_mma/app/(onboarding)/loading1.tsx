import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function Loading1Screen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/(onboarding)/loading2');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <IconSymbol name="paw.fill" size={60} color="#fff" />
        </View>
        <Text style={styles.logoText}>PetCare<Text style={styles.hubText}>Hub</Text></Text>
        <Text style={styles.subtitle}>Chăm sóc, vui đùa và cùng nhau phát triển</Text>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.loadingRow}>
          <Text style={styles.loadingText}>Đang khởi chạy...</Text>
          <Text style={styles.percentText}>30%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '30%' }]} />
        </View>
        <View style={styles.rewardsRow}>
          <View style={styles.rewardItem}>
             <IconSymbol name="star.fill" size={14} color="#FF3B30" />
             <Text style={styles.rewardText}>Kiếm XP</Text>
          </View>
          <View style={styles.rewardItem}>
             <IconSymbol name="star.fill" size={14} color="#FF3B30" />
             <Text style={styles.rewardText}>Nhận Coins</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 24 },
  content: { alignItems: 'center', marginTop: 100 },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#FF4D4D',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  hubText: { color: '#FF4D4D' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', paddingHorizontal: 20 },
  bottomSection: { position: 'absolute', bottom: 60, left: 24, right: 24 },
  loadingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  loadingText: { fontSize: 14, color: '#666' },
  percentText: { fontSize: 14, color: '#FF4D4D', fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, marginBottom: 16 },
  progressBarFill: { height: 6, backgroundColor: '#FF4D4D', borderRadius: 3 },
  rewardsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  rewardItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rewardText: { fontSize: 14, color: '#1a1a1a', fontWeight: '600' },
});
