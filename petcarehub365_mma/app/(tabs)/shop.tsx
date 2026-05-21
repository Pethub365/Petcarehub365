import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ShopScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gói Đăng Ký PetCare</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.mainTitle}>Nâng cấp trải nghiệm <Text style={{color: '#FF4D4D'}}>PetCare Hub</Text></Text>
          <Text style={styles.subtitle}>Chọn gói dịch vụ phù hợp để chăm sóc thú cưng của bạn tốt hơn mỗi ngày với công nghệ AI và chuyên gia.</Text>

          {/* FREE PLAN */}
          <View style={styles.planCard}>
              <Text style={styles.planName}>MIỄN PHÍ</Text>
              <Text style={styles.planPrice}>0đ<Text style={styles.planPeriod}>/tháng</Text></Text>
              <TouchableOpacity style={styles.currentBtn} onPress={() => Alert.alert('Thông báo', 'Bạn hiện đang được áp dụng gói này.')}>
                  <Text style={styles.currentBtnText}>Sử dụng hiện tại</Text>
              </TouchableOpacity>
              
              <View style={styles.featureItem}><IconSymbol name="checkmark" size={16} color="#FF9800" /><Text style={styles.featureTitle}>Theo dõi sức khoẻ cơ bản</Text></View>
              <View style={styles.featureItem}><IconSymbol name="checkmark" size={16} color="#FF9800" /><Text style={styles.featureTitle}>Cộng đồng hỗ trợ 24/7</Text></View>
              <View style={styles.featureItem}><IconSymbol name="xmark" size={16} color="#999" /><Text style={styles.featureTitleDisabled}>Không có hướng dẫn chuyên sâu</Text></View>
          </View>

          {/* PREMIUM PLAN */}
          <View style={[styles.planCard, styles.premiumCard]}>
              <View style={styles.popularBadge}><Text style={styles.popularText}>PHỔ BIẾN NHẤT</Text></View>
              <Text style={styles.planName}>PREMIUM</Text>
              <Text style={[styles.planPrice, {color: '#FF4D4D'}]}>49.000đ<Text style={styles.planPeriod}>/tháng</Text></Text>
              <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/checkout')}>
                  <Text style={styles.upgradeBtnText}>Nâng cấp ngay</Text>
              </TouchableOpacity>
              
              <View style={styles.featureItem}><IconSymbol name="checkmark" size={16} color="#FF4D4D" /><Text style={styles.featureTitle}>Không quảng cáo</Text></View>
              <View style={styles.featureItem}><IconSymbol name="checkmark" size={16} color="#FF4D4D" /><Text style={styles.featureTitle}>Lưu trữ hồ sơ không giới hạn</Text></View>
              <View style={styles.featureItem}><IconSymbol name="checkmark" size={16} color="#FF4D4D" /><Text style={styles.featureTitle}>Phân tích AI nâng cao</Text></View>
          </View>

          {/* VIP PLAN */}
          <View style={styles.planCard}>
              <Text style={styles.planName}>VIP</Text>
              <Text style={styles.planPrice}>139.000đ<Text style={styles.planPeriod}>/tháng</Text></Text>
              <TouchableOpacity style={[styles.upgradeBtn, {backgroundColor: '#1a1a1a'}]} onPress={() => router.push('/checkout')}>
                  <Text style={styles.upgradeBtnText}>Nâng cấp ngay</Text>
              </TouchableOpacity>
              
              <View style={styles.featureItem}><IconSymbol name="checkmark" size={16} color="#66BB6A" /><Text style={styles.featureTitle}>Đầy đủ tính năng Premium</Text></View>
              <View style={styles.featureItem}><IconSymbol name="checkmark" size={16} color="#66BB6A" /><Text style={styles.featureTitle}>Báo cáo chuyên sâu hàng tuần</Text></View>
              <View style={styles.featureItem}><IconSymbol name="checkmark" size={16} color="#66BB6A" /><Text style={styles.featureTitle}>Tư vấn bác sĩ trực tuyến 24/7</Text></View>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  content: { padding: 20 },
  mainTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 32, paddingHorizontal: 16 },
  
  planCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#E5E5E5' },
  premiumCard: { borderColor: '#FF4D4D', borderWidth: 2, position: 'relative', marginTop: 16 },
  popularBadge: { position: 'absolute', top: -14, alignSelf: 'center', backgroundColor: '#FF4D4D', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  popularText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  planName: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  planPrice: { fontSize: 32, fontWeight: '900', color: '#1a1a1a', marginBottom: 16 },
  planPeriod: { fontSize: 14, fontWeight: 'bold', color: '#999' },
  
  currentBtn: { backgroundColor: '#F0F0F0', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  currentBtnText: { color: '#666', fontWeight: 'bold', fontSize: 14 },
  upgradeBtn: { backgroundColor: '#FF4D4D', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  upgradeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  featureTitle: { fontSize: 13, color: '#1a1a1a', fontWeight: '500' },
  featureTitleDisabled: { fontSize: 13, color: '#999', textDecorationLine: 'line-through' }
});
