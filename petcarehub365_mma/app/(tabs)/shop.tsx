import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';

export default function ShopScreen() {
  const isDark = useColorScheme() === 'dark';

  const bgColors = {
    main: isDark ? '#121212' : '#F8F9FA',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1B2530',
    subtext: isDark ? '#A0AEC0' : '#8A9AA9',
    border: isDark ? '#2D3748' : '#F1F3F5',
    primary: '#EC4B4B',
    pinkBg: isDark ? '#2D1B1B' : '#FFF5F5',
    pinkBorder: isDark ? '#4A2B2B' : '#FFEBEB',
    navyBtn: '#1B2530',
  };

  const handleSelectPackage = (packageType: 'MONTHLY' | 'YEARLY', name: string, price: string) => {
    router.push({
      pathname: '/checkout',
      params: { packageType, name, price }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColors.main }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColors.card, borderBottomColor: bgColors.border }]}>
        <View style={[styles.shopIconWrap, { backgroundColor: bgColors.pinkBg }]}>
          <Ionicons name="bag" size={20} color={bgColors.primary} />
        </View>
        <Text style={[styles.headerTitle, { color: bgColors.text }]}>Gói Đăng Ký PetCare</Text>
        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.backBtn}>
          <Ionicons name="notifications-outline" size={22} color={bgColors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Title & Subtitle */}
        <Text style={[styles.mainTitle, { color: bgColors.text }]}>
          Nâng cấp trải nghiệm{'\n'}
          <Text style={{ color: bgColors.primary }}>PetCare Hub</Text>
        </Text>
        <Text style={[styles.subtitle, { color: bgColors.subtext }]}>
          Chọn gói dịch vụ phù hợp để chăm sóc thú cưng của bạn tốt hơn mỗi ngày với công nghệ AI và chuyên gia.
        </Text>

        {/* FREE PLAN */}
        <View style={[styles.planCard, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
          <Text style={[styles.planLabel, { color: bgColors.subtext }]}>MIỄN PHÍ</Text>
          <Text style={[styles.planPrice, { color: bgColors.text }]}>
            0đ<Text style={[styles.planPeriod, { color: bgColors.subtext }]}>/tháng</Text>
          </Text>
          
          <TouchableOpacity 
            style={[styles.actionBtn, styles.freeBtn]} 
            onPress={() => Alert.alert('Thông báo', 'Bạn hiện đang áp dụng gói này.')}
          >
            <Text style={styles.freeBtnText}>Sử dụng hiện tại</Text>
          </TouchableOpacity>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={bgColors.primary} />
              <Text style={[styles.featureText, { color: bgColors.text }]}>Theo dõi sức khỏe cơ bản</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={bgColors.primary} />
              <Text style={[styles.featureText, { color: bgColors.text }]}>Cộng đồng hỗ trợ 24/7</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="xmark" size={16} color={bgColors.subtext} />
              <Text style={[styles.featureText, { color: bgColors.subtext, textDecorationLine: 'line-through' }]}>
                Không có hướng dẫn chuyên sâu
              </Text>
            </View>
          </View>
        </View>

        {/* MONTHLY PREMIUM PLAN (POPULAR) */}
        <View style={[
          styles.planCard, 
          styles.popularCard, 
          { backgroundColor: bgColors.card, borderColor: bgColors.primary }
        ]}>
          <View style={[styles.popularBadge, { backgroundColor: bgColors.primary }]}>
            <Text style={styles.popularText}>PHỔ BIẾN NHẤT</Text>
          </View>
          
          <Text style={[styles.planLabel, { color: bgColors.primary }]}>PREMIUM</Text>
          <Text style={[styles.planPrice, { color: bgColors.text }]}>
            49.000đ<Text style={[styles.planPeriod, { color: bgColors.subtext }]}>/tháng</Text>
          </Text>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: bgColors.primary }]} 
            onPress={() => handleSelectPackage('MONTHLY', 'Gói Premium Tháng', '49.000đ')}
          >
            <Text style={styles.actionBtnText}>Nâng cấp ngay</Text>
          </TouchableOpacity>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={bgColors.primary} />
              <Text style={[styles.featureText, { color: bgColors.text }]}>Không quảng cáo</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={bgColors.primary} />
              <Text style={[styles.featureText, { color: bgColors.text }]}>Lưu trữ hồ sơ không giới hạn</Text>
            </View>
          </View>
        </View>

        {/* YEARLY VIP PLAN */}
        <View style={[styles.planCard, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
          <Text style={[styles.planLabel, { color: bgColors.navyBtn }]}>VIP</Text>
          <Text style={[styles.planPrice, { color: bgColors.text }]}>
            139.000đ<Text style={[styles.planPeriod, { color: bgColors.subtext }]}>/tháng</Text>
          </Text>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: bgColors.navyBtn }]} 
            onPress={() => handleSelectPackage('YEARLY', 'Gói VIP Tháng', '139.000đ')}
          >
            <Text style={styles.actionBtnText}>Nâng cấp ngay</Text>
          </TouchableOpacity>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={bgColors.primary} />
              <Text style={[styles.featureText, { color: bgColors.text }]}>Mở khóa hướng dẫn chuyên sâu</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={bgColors.primary} />
              <Text style={[styles.featureText, { color: bgColors.text }]}>Phân tích AI nâng cao</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={bgColors.primary} />
              <Text style={[styles.featureText, { color: bgColors.text }]}>Báo cáo chuyên sâu hàng tuần</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={bgColors.primary} />
              <Text style={[styles.featureText, { color: bgColors.text }]}>Tất cả quyền lợi Premium</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={bgColors.primary} />
              <Text style={[styles.featureText, { color: bgColors.text }]}>Gói gia đình (Family Plan)</Text>
            </View>
          </View>
        </View>

        {/* Why choose paid plan section */}
        <Text style={[styles.reasonTitle, { color: bgColors.text }]}>Tại sao nên chọn gói trả phí?</Text>
        
        <View style={styles.reasonWrapper}>
          {/* AI personalization */}
          <View style={[styles.reasonCard, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
            <View style={[styles.reasonIconWrap, { backgroundColor: bgColors.pinkBg }]}>
              <IconSymbol name="sparkles" size={22} color={bgColors.primary} />
            </View>
            <View style={styles.reasonTextWrap}>
              <Text style={[styles.reasonCardTitle, { color: bgColors.text }]}>Cá nhân hóa bằng AI</Text>
              <Text style={[styles.reasonCardDesc, { color: bgColors.subtext }]}>
                Hệ thống AI phân tích hành vi và thói quen để đưa ra lời khuyên chính xác nhất cho từng bé cưng.
              </Text>
            </View>
          </View>

          {/* Peace of mind */}
          <View style={[styles.reasonCard, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
            <View style={[styles.reasonIconWrap, { backgroundColor: bgColors.pinkBg }]}>
              <IconSymbol name="heart.fill" size={22} color={bgColors.primary} />
            </View>
            <View style={styles.reasonTextWrap}>
              <Text style={[styles.reasonCardTitle, { color: bgColors.text }]}>An tâm tuyệt đối</Text>
              <Text style={[styles.reasonCardDesc, { color: bgColors.subtext }]}>
                Kết nối trực tiếp với bác sĩ thú y mọi lúc mọi nơi, xử lý nhanh các tình huống khẩn cấp.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    borderBottomWidth: 1 
  },
  backBtn: { padding: 4 },
  shopIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  
  mainTitle: { 
    fontSize: 26, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginBottom: 12, 
    lineHeight: 34 
  },
  subtitle: { 
    fontSize: 13, 
    textAlign: 'center', 
    lineHeight: 20, 
    marginBottom: 36, 
    paddingHorizontal: 10 
  },
  
  planCard: { 
    borderRadius: 20, 
    padding: 24, 
    marginBottom: 24, 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  popularCard: { 
    borderWidth: 2, 
    position: 'relative', 
    marginTop: 10 
  },
  popularBadge: { 
    position: 'absolute', 
    top: -13, 
    alignSelf: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  popularText: { 
    color: '#FFFFFF', 
    fontSize: 10, 
    fontWeight: '800' 
  },
  planLabel: { 
    fontSize: 13, 
    fontWeight: '800', 
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  planPrice: { 
    fontSize: 32, 
    fontWeight: '900', 
    marginBottom: 20 
  },
  planPeriod: { 
    fontSize: 14, 
    fontWeight: '700' 
  },
  
  actionBtn: { 
    height: 48, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  actionBtnText: { 
    color: '#FFFFFF', 
    fontWeight: '700', 
    fontSize: 14 
  },
  freeBtn: { 
    backgroundColor: '#F0F4F8' 
  },
  freeBtnText: { 
    color: '#8A9AA9', 
    fontWeight: '700', 
    fontSize: 14 
  },
  
  featureList: { 
    gap: 12 
  },
  featureItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  featureText: { 
    fontSize: 13, 
    fontWeight: '600' 
  },

  // Reason Section
  reasonTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  reasonWrapper: {
    gap: 14,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  reasonIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  reasonTextWrap: {
    flex: 1,
  },
  reasonCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  reasonCardDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
});
