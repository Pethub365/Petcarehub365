import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

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
        {/* Concentric circles around the paw icon */}
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <FontAwesome name="paw" size={48} color="#fff" />
          </View>
        </View>

        {/* Logo Text with Heart above "e" */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoRow}>
            <Text style={styles.logoTextMain}>PetCar</Text>
            <View style={styles.eWrapper}>
              <Text style={styles.logoTextMain}>e</Text>
              <FontAwesome name="heart" size={10} color="#FF3B30" style={styles.heartIcon} />
            </View>
            <Text style={styles.logoTextHub}>Hub</Text>
          </View>
        </View>

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
             <FontAwesome name="star" size={16} color="#FF3B30" />
             <Text style={styles.rewardText}>Kiếm XP</Text>
          </View>
          <View style={styles.rewardItem}>
             <MaterialIcons name="local-play" size={16} color="#FF3B30" />
             <Text style={styles.rewardText}>Nhận Coins</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAF9F6', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 60,
  },
  content: { 
    alignItems: 'center', 
    justifyContent: 'center',
    flex: 1,
  },
  outerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFEBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  innerCircle: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoTextMain: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1A2E35', // Slate dark color matching screenshot
    letterSpacing: -0.5,
  },
  logoTextHub: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FF3B30',
    letterSpacing: -0.5,
  },
  eWrapper: {
    position: 'relative',
  },
  heartIcon: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 14, 
    color: '#5B7380', // Soft blue-gray subtext
    textAlign: 'center', 
    fontStyle: 'italic',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  bottomSection: { 
    width: '100%',
  },
  loadingRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8,
    alignItems: 'center',
  },
  loadingText: { 
    fontSize: 14, 
    color: '#5B7380',
    fontWeight: '500',
  },
  percentText: { 
    fontSize: 14, 
    color: '#FF3B30', 
    fontWeight: 'bold' 
  },
  progressBarBg: { 
    height: 8, 
    backgroundColor: '#E8F8F5', // Soft cyan track
    borderRadius: 4, 
    marginBottom: 24,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: { 
    height: 8, 
    backgroundColor: '#FF3B30', 
    borderRadius: 4,
  },
  rewardsRow: { 
    flexDirection: 'row', 
    justifyContent: 'center',
    gap: 32,
    alignItems: 'center',
  },
  rewardItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
  },
  rewardText: { 
    fontSize: 14, 
    color: '#1A2E35', 
    fontWeight: '600' 
  },
});
