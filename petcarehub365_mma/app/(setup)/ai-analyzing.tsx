import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AiAnalyzingScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false
    }).start();

    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Phân tích dữ liệu</Text>
      
      <View style={styles.centerContent}>
          <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.avatarImagePlaceholder}>
               <IconSymbol name="paw.fill" size={60} color="#FFD1D1" />
            </View>
            <View style={styles.aiBadge}>
                <IconSymbol name="sparkles" size={16} color="#fff" />
            </View>
          </Animated.View>

          <Text style={styles.mainTitle}>AI đang phân tích dữ liệu...</Text>
          <Text style={styles.desc}>
            Chúng tôi đang tạo lộ trình chăm sóc riêng cho <Text style={{fontWeight: 'bold', color: '#FF4D4D'}}>Mochi</Text> dựa trên những thông tin bạn đã cung cấp.
          </Text>

          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          
          <Text style={styles.progressStatus}>
            <IconSymbol name="gearshape.fill" size={12} color="#FF4D4D" /> Đang tối ưu hóa chế độ dinh dưỡng
          </Text>
          <Text style={styles.progressPercent}>TIẾN ĐỘ : 65%</Text>
      </View>

      <View style={styles.factCard}>
          <IconSymbol name="info.circle.fill" size={24} color="#FF4D4D" style={{marginTop: 4}} />
          <View style={{flex: 1, marginLeft: 12}}>
              <Text style={styles.factTitle}>Bạn có biết?</Text>
              <Text style={styles.factDesc}>Lộ trình cá nhân hóa giúp thú cưng của bạn sống thọ hơn trung bình 15% thông qua việc quản lý dinh dưỡng chính xác.</Text>
          </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 24 },
  headerTitle: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginTop: 20 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarRing: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: '#FFEBEB', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  avatarImagePlaceholder: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  aiBadge: { position: 'absolute', bottom: 5, right: 5, width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF4D4D', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FAFAFA' },
  mainTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 12 },
  desc: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20, marginBottom: 40 },
  progressContainer: { width: '100%', height: 6, backgroundColor: '#E5E5E5', borderRadius: 3, overflow: 'hidden', marginBottom: 16 },
  progressBar: { height: '100%', backgroundColor: '#FF4D4D', borderRadius: 3 },
  progressStatus: { fontSize: 12, color: '#FF4D4D', fontWeight: '600', marginBottom: 4 },
  progressPercent: { fontSize: 10, color: '#999', fontWeight: 'bold' },
  factCard: { flexDirection: 'row', backgroundColor: '#FFF5F5', padding: 16, borderRadius: 16, marginBottom: 20 },
  factTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  factDesc: { fontSize: 12, color: '#666', lineHeight: 18 },
});
