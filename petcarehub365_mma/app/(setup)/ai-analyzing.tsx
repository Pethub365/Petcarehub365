import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image, TouchableOpacity, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AiAnalyzingScreen() {
  const params = useLocalSearchParams();
  const petName = String(params.petName || 'Mochi');
  const avatarUri = params.avatarUri ? String(params.avatarUri) : null;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [progressPercent, setProgressPercent] = useState(0);

  // Fallback to Golden Retriever image from Unsplash to match Figma design
  const defaultAvatar = 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=300';

  useEffect(() => {
    // Pulse animation for avatar ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false
    }).start();

    // Progress percentage state counter
    const interval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 28); // 28ms * 100 = ~2.8 seconds, aligning with the 3s progress duration

    // Navigation redirect after analysis completes
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#1B2530" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phân tích dữ liệu</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <View style={styles.centerContent}>
        {/* Pulsing Outer Ring */}
        <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.avatarInnerContainer}>
            <Image 
              source={{ uri: avatarUri || defaultAvatar }} 
              style={styles.avatarImage} 
            />
          </View>
          {/* Brain-Gear AI Badge */}
          <View style={styles.aiBadge}>
            <FontAwesome5 name="brain" size={15} color="#fff" />
          </View>
        </Animated.View>

        {/* Titles */}
        <Text style={styles.mainTitle}>
          AI đang phân tích{'\n'}dữ liệu...
        </Text>
        
        <Text style={styles.desc}>
          Chúng tôi đang tạo lộ trình chăm sóc riêng cho{' '}
          <Text style={styles.highlightText}>{petName}</Text> dựa trên những thông tin bạn đã cung cấp.
        </Text>

        {/* Progress Tracker */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        
        {/* Status indicator row */}
        <View style={styles.statusRow}>
          <Ionicons name="checkmark-circle" size={16} color="#EC4B4B" style={styles.statusIcon} />
          <Text style={styles.progressStatus}>
            Đang tối ưu hóa chế độ dinh dưỡng
          </Text>
        </View>

        {/* Percentage text */}
        <Text style={styles.progressPercent}>TIẾN ĐỘ : {progressPercent}%</Text>
      </View>

      {/* Fact Card */}
      <View style={styles.factCard}>
        <Ionicons name="information-circle" size={24} color="#EC4B4B" style={styles.factIcon} />
        <View style={styles.factTextContainer}>
          <Text style={styles.factTitle}>Bạn có biết?</Text>
          <Text style={styles.factDesc}>
            Lộ trình cá nhân hóa giúp thú cưng của bạn sống thọ hơn trung bình 15% thông qua việc quản lý dinh dưỡng chính xác.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F9' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: Platform.OS === 'android' ? 10 : 0
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B2530', textAlign: 'center', flex: 1, marginRight: 8 },
  
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  
  avatarRing: { 
    width: 174, 
    height: 174, 
    borderRadius: 87, 
    borderWidth: 1, 
    borderColor: '#FFEBEB', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.02, 
    shadowRadius: 8,
    marginBottom: 40,
    position: 'relative'
  },
  avatarInnerContainer: { 
    width: 154, 
    height: 154, 
    borderRadius: 77, 
    overflow: 'hidden', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarImage: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  aiBadge: { 
    position: 'absolute', 
    bottom: 5, 
    right: 5, 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: '#EC4B4B', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#FAF9F9',
    shadowColor: '#EC4B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2
  },

  mainTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1B2530', 
    textAlign: 'center', 
    lineHeight: 34, 
    marginBottom: 16 
  },
  desc: { 
    fontSize: 14, 
    color: '#8A9AA9', 
    textAlign: 'center', 
    lineHeight: 22, 
    paddingHorizontal: 16, 
    marginBottom: 36 
  },
  highlightText: { 
    fontWeight: 'bold', 
    color: '#EC4B4B' 
  },

  progressContainer: { 
    width: '100%', 
    height: 8, 
    backgroundColor: '#FFF0F0', 
    borderRadius: 4, 
    overflow: 'hidden', 
    marginBottom: 16 
  },
  progressBar: { 
    height: '100%', 
    backgroundColor: '#EC4B4B', 
    borderRadius: 4 
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  statusIcon: {
    marginRight: 6
  },
  progressStatus: { 
    fontSize: 13, 
    color: '#EC4B4B', 
    fontWeight: 'bold' 
  },
  progressPercent: { 
    fontSize: 11, 
    color: '#8A9AA9', 
    fontWeight: 'bold',
    letterSpacing: 0.5
  },

  factCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF5F5', 
    padding: 18, 
    borderRadius: 24, 
    borderWidth: 1,
    borderColor: '#FFEBEB',
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'flex-start'
  },
  factIcon: { 
    marginTop: 2 
  },
  factTextContainer: { 
    flex: 1, 
    marginLeft: 12 
  },
  factTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#1B2530', 
    marginBottom: 4 
  },
  factDesc: { 
    fontSize: 12, 
    color: '#8A9AA9', 
    lineHeight: 18,
    fontWeight: '500'
  },
});
