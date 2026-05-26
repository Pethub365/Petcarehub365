import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function Loading2Screen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Tilting gold crown positioned absolute on the puppy's head */}
        <FontAwesome5 name="crown" size={32} color="#FFD700" style={styles.crownIcon} />
        
        {/* Cute puppy illustration in the center */}
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop' }} 
          style={styles.puppyImage} 
        />

        {/* Level UP! Red Badge */}
        <View style={styles.badgeWrapper}>
            <View style={styles.badgeItem}>
                <View style={styles.miniStarBg}>
                  <FontAwesome name="star" size={8} color="#FF3B30" />
                </View>
                <Text style={styles.badgeTextSmall}>Level UP!</Text>
            </View>
        </View>

        {/* Gold Coin Reward Badge */}
        <View style={styles.coinBadge}>
            <View style={styles.coinCircle}>
              <FontAwesome name="dollar" size={10} color="#FFF" />
            </View>
            <View>
              <Text style={styles.coinTextSm}>Nhận</Text>
              <Text style={styles.coinTextLg}>+50 Coins</Text>
            </View>
        </View>
      </View>
      
      <Text style={styles.title}>Level Up Your Care</Text>
      <Text style={styles.desc}>Kiếm XP và Coins bằng cách làm nhiệm vụ hằng ngày và tham gia các sự kiện.</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
        <View style={styles.buttonContent}>
          <Text style={styles.buttonText}>Tiếp tục</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    paddingHorizontal: 24, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  card: {
    width: '100%', 
    height: 350, 
    backgroundColor: '#FFF5F5',
    borderRadius: 32, 
    marginBottom: 40,
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative',
  },
  crownIcon: {
    position: 'absolute',
    top: 50,
    zIndex: 10,
    transform: [{ rotate: '-12deg' }],
  },
  puppyImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginTop: 20,
  },
  badgeWrapper: {
    position: 'absolute', 
    right: 16, 
    top: 140,
    backgroundColor: '#FF3B30', 
    paddingHorizontal: 12, 
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  badgeItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniStarBg: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTextSmall: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  coinBadge: {
    position: 'absolute', 
    left: 16, 
    bottom: 40,
    backgroundColor: '#fff', 
    paddingHorizontal: 16, 
    paddingVertical: 8,
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 8,
    elevation: 3,
  },
  coinCircle: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: '#FFCC00', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  coinTextSm: { fontSize: 10, color: '#8F9CA3', fontWeight: '500' },
  coinTextLg: { fontSize: 13, fontWeight: 'bold', color: '#1A2E35' },
  title: { fontSize: 28, fontWeight: '900', color: '#1A2E35', marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 },
  desc: { fontSize: 14, color: '#5B7380', textAlign: 'center', lineHeight: 22, marginBottom: 40, paddingHorizontal: 16 },
  button: {
    backgroundColor: '#FF3B30', 
    width: '100%', 
    height: 56,
    borderRadius: 28, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
