import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function Loading2Screen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
           <IconSymbol name="paw.fill" size={80} color="#FFD1D1" />
        </View>
        <View style={styles.badgeWrapper}>
            <View style={styles.badgeItem}>
                <IconSymbol name="star.fill" size={12} color="#fff" />
                <Text style={styles.badgeTextSmall}>Level UP!</Text>
            </View>
        </View>
        <View style={styles.coinBadge}>
            <View style={styles.coinCircle}><IconSymbol name="star.fill" size={10} color="#FFA500" /></View>
            <View>
              <Text style={styles.coinTextSm}>Nhận</Text>
              <Text style={styles.coinTextLg}>+50 Coins</Text>
            </View>
        </View>
      </View>
      
      <Text style={styles.title}>Level Up Your Care</Text>
      <Text style={styles.desc}>Kiếm XP và Coins bằng cách làm nhiệm vụ hằng ngày và tham gia các sự kiện.</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.buttonText}>Tiếp tục  →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 24, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '100%', height: 350, backgroundColor: '#FFEBEB',
    borderRadius: 32, marginBottom: 40,
    alignItems: 'center', justifyContent: 'center', position: 'relative'
  },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  badgeWrapper: {
    position: 'absolute', right: -10, top: '50%',
    backgroundColor: '#FF4D4D', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16,
  },
  badgeItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeTextSmall: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  coinBadge: {
    position: 'absolute', left: -10, bottom: 40,
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  coinCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF5E6', justifyContent: 'center', alignItems: 'center' },
  coinTextSm: { fontSize: 10, color: '#666' },
  coinTextLg: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 40, paddingHorizontal: 16 },
  button: {
    backgroundColor: '#FF4D4D', width: '100%', paddingVertical: 18,
    borderRadius: 24, alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
