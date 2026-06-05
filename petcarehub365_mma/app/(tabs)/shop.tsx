import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, useColorScheme, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import subscriptionApi from '../../apis/subscriptionApi';
import { useAuth } from '../../contexts/AuthContext';

type PlanType = 'FREE' | 'PREMIUM' | 'VIP';

interface Plan {
  plan_type: PlanType;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_current: boolean;
  can_upgrade: boolean;
}

interface SubscriptionInfo {
  plan_type: PlanType;
  status: string;
  expires_at: string | null;
  days_remaining: number | null;
}

export default function ShopScreen() {
  const isDark = useColorScheme() === 'dark';
  const { user } = useAuth();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

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
    successBg: isDark ? '#1A2E1A' : '#F0FFF4',
    successBorder: '#27AE60',
    goldBtn: '#D4A017',
    goldBg: isDark ? '#2D2500' : '#FFFBEB',
    goldBorder: '#F5C518',
  };

  // Load plans from API
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          setLoading(true);
          const [plansRes, subRes] = await Promise.all([
            subscriptionApi.getPlans() as any,
            subscriptionApi.getMySubscription() as any,
          ]);
          if (plansRes?.success) setPlans(plansRes.data.plans);
          if (subRes?.success) setSubscription(subRes.data.subscription);
        } catch (err) {
          console.error('Error loading plans:', err);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  const formatPrice = (amount: number) => {
    if (amount === 0) return '0đ';
    return `${amount.toLocaleString('vi-VN')}đ`;
  };

  const handleSelectPackage = (plan: Plan) => {
    if (!plan.can_upgrade) return;

    const price = selectedDuration === 'MONTHLY'
      ? plan.price_monthly
      : plan.price_yearly;

    const priceLabel = selectedDuration === 'YEARLY'
      ? `${formatPrice(plan.price_yearly)} (20% OFF)`
      : formatPrice(plan.price_monthly);

    router.push({
      pathname: '/checkout',
      params: {
        packageType: selectedDuration,
        planType: plan.plan_type,
        name: plan.name,
        price: priceLabel,
        priceAmount: price.toString(),
      }
    });
  };

  // Hiển thị badge ngày còn lại nếu user đang có gói trả phí
  const renderSubscriptionBanner = () => {
    if (!subscription || subscription.plan_type === 'FREE') return null;

    const daysLeft = subscription.days_remaining ?? 0;
    const isExpiringSoon = daysLeft <= 7;
    const planLabel = subscription.plan_type === 'VIP' ? '👑 VIP' : '⭐ Premium';

    return (
      <View style={[
        styles.subBanner,
        {
          backgroundColor: isExpiringSoon ? '#FFF3CD' : bgColors.successBg,
          borderColor: isExpiringSoon ? '#F5C518' : bgColors.successBorder,
        }
      ]}>
        <Ionicons
          name={isExpiringSoon ? 'warning' : 'checkmark-circle'}
          size={18}
          color={isExpiringSoon ? '#D4A017' : '#27AE60'}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.subBannerTitle, { color: isExpiringSoon ? '#92400E' : '#276749' }]}>
            Gói {planLabel} đang hoạt động
          </Text>
          <Text style={[styles.subBannerSub, { color: isExpiringSoon ? '#B45309' : '#2F855A' }]}>
            {isExpiringSoon
              ? `⚠️ Còn ${daysLeft} ngày — Gia hạn ngay để không mất quyền lợi`
              : `Còn ${daysLeft} ngày (đến ${new Date(subscription.expires_at!).toLocaleDateString('vi-VN')})`
            }
          </Text>
        </View>
      </View>
    );
  };

  // Thứ tự tier: FREE < PREMIUM < VIP
  const PLAN_TIER: Record<PlanType, number> = { FREE: 0, PREMIUM: 1, VIP: 2 };
  const currentTier = PLAN_TIER[subscription?.plan_type ?? 'FREE'];

  // Nút action của mỗi gói
  const renderPlanButton = (plan: Plan) => {
    const planTier = PLAN_TIER[plan.plan_type];

    // Gói đang dùng hiện tại
    if (plan.is_current) {
      return (
        <View style={[styles.actionBtn, { backgroundColor: bgColors.successBg, borderWidth: 1, borderColor: bgColors.successBorder }]}>
          <Ionicons name="checkmark-circle" size={16} color="#27AE60" style={{ marginRight: 6 }} />
          <Text style={[styles.actionBtnText, { color: '#27AE60' }]}>Đang sử dụng</Text>
        </View>
      );
    }

    // Gói FREE: không bao giờ cần nút nâng cấp (là gói cơ sở)
    if (plan.plan_type === 'FREE') {
      return (
        <View style={[styles.actionBtn, { backgroundColor: bgColors.border }]}>
          <Text style={[styles.actionBtnText, { color: bgColors.subtext }]}>Gói cơ bản (đã bao gồm)</Text>
        </View>
      );
    }

    // Gói thấp hơn tier hiện tại → đã sở hữu quyền lợi này
    if (planTier < currentTier) {
      return (
        <View style={[styles.actionBtn, { backgroundColor: bgColors.successBg, borderWidth: 1, borderColor: bgColors.successBorder }]}>
          <Ionicons name="checkmark-circle" size={16} color="#27AE60" style={{ marginRight: 6 }} />
          <Text style={[styles.actionBtnText, { color: '#27AE60' }]}>Đã sở hữu</Text>
        </View>
      );
    }

    // Gói cao hơn → hiện nút nâng cấp
    const btnColor = plan.plan_type === 'VIP' ? bgColors.navyBtn : bgColors.primary;
    const priceDisplay = selectedDuration === 'YEARLY'
      ? `${formatPrice(Math.round(plan.price_yearly / 12))}/tháng`
      : `${formatPrice(plan.price_monthly)}/tháng`;

    return (
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: btnColor }]}
        onPress={() => handleSelectPackage(plan)}
        activeOpacity={0.85}
      >
        <Text style={styles.actionBtnText}>
          Nâng cấp — {priceDisplay}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPlan = (plan: Plan, isPopular = false) => {
    const borderColor = plan.is_current
      ? bgColors.successBorder
      : isPopular
        ? bgColors.primary
        : bgColors.border;

    return (
      <View
        key={plan.plan_type}
        style={[
          styles.planCard,
          {
            backgroundColor: bgColors.card,
            borderColor,
            borderWidth: plan.is_current || isPopular ? 2 : 1,
            marginTop: isPopular ? 10 : 0,
          }
        ]}
      >
        {/* Badge */}
        {isPopular && !plan.is_current && (
          <View style={[styles.popularBadge, { backgroundColor: bgColors.primary }]}>
            <Text style={styles.popularText}>PHỔ BIẾN NHẤT</Text>
          </View>
        )}
        {plan.is_current && (
          <View style={[styles.popularBadge, { backgroundColor: bgColors.successBorder }]}>
            <Text style={styles.popularText}>GÓI ĐANG DÙNG</Text>
          </View>
        )}

        {/* Label & Price */}
        <Text style={[styles.planLabel, { color: isPopular ? bgColors.primary : bgColors.text }]}>
          {plan.plan_type}
        </Text>

        {plan.price_monthly === 0 ? (
          <Text style={[styles.planPrice, { color: bgColors.text }]}>
            Miễn phí
          </Text>
        ) : (
          <View>
            <Text style={[styles.planPrice, { color: bgColors.text }]}>
              {selectedDuration === 'YEARLY'
                ? formatPrice(Math.round(plan.price_yearly / 12))
                : formatPrice(plan.price_monthly)}
              <Text style={[styles.planPeriod, { color: bgColors.subtext }]}>/tháng</Text>
            </Text>
            {selectedDuration === 'YEARLY' && (
              <Text style={styles.yearlyNote}>
                = {formatPrice(plan.price_yearly)}/năm (tiết kiệm 20%)
              </Text>
            )}
          </View>
        )}

        {/* Action Button */}
        {renderPlanButton(plan)}

        {/* Features */}
        <View style={styles.featureList}>
          {plan.features.map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={isPopular ? bgColors.primary : '#27AE60'} />
              <Text style={[styles.featureText, { color: bgColors.text }]}>{f}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColors.main }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={bgColors.primary} />
          <Text style={[styles.loadingText, { color: bgColors.subtext }]}>Đang tải gói đăng ký...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const freePlan = plans.find(p => p.plan_type === 'FREE');
  const premiumPlan = plans.find(p => p.plan_type === 'PREMIUM');
  const vipPlan = plans.find(p => p.plan_type === 'VIP');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColors.main }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColors.card, borderBottomColor: bgColors.border }]}>
        <View style={[styles.shopIconWrap, { backgroundColor: bgColors.pinkBg }]}>
          <Ionicons name="bag" size={20} color={bgColors.primary} />
        </View>
        <Text style={[styles.headerTitle, { color: bgColors.text }]}>Gói Đăng Ký PetCare</Text>
        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={bgColors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subscription status banner */}
        {renderSubscriptionBanner()}

        {/* Title */}
        <Text style={[styles.mainTitle, { color: bgColors.text }]}>
          Nâng cấp trải nghiệm{'\n'}
          <Text style={{ color: bgColors.primary }}>PetCare Hub</Text>
        </Text>
        <Text style={[styles.subtitle, { color: bgColors.subtext }]}>
          Chọn gói dịch vụ phù hợp để chăm sóc thú cưng của bạn tốt hơn mỗi ngày.
        </Text>

        {/* Duration Toggle */}
        <View style={[styles.durationToggle, { backgroundColor: bgColors.border }]}>
          <TouchableOpacity
            style={[styles.durationBtn, selectedDuration === 'MONTHLY' && { backgroundColor: bgColors.card }]}
            onPress={() => setSelectedDuration('MONTHLY')}
          >
            <Text style={[styles.durationBtnText, { color: selectedDuration === 'MONTHLY' ? bgColors.primary : bgColors.subtext }]}>
              Hàng tháng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.durationBtn, selectedDuration === 'YEARLY' && { backgroundColor: bgColors.card }]}
            onPress={() => setSelectedDuration('YEARLY')}
          >
            <Text style={[styles.durationBtnText, { color: selectedDuration === 'YEARLY' ? bgColors.primary : bgColors.subtext }]}>
              Hàng năm
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>-20%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        {freePlan && renderPlan(freePlan)}
        {premiumPlan && renderPlan(premiumPlan, true)}
        {vipPlan && renderPlan(vipPlan)}

        {/* Transaction History Link */}
        <TouchableOpacity
          style={[styles.historyLink, { borderColor: bgColors.border }]}
          onPress={() => Alert.alert('Lịch sử giao dịch', 'Tính năng đang được phát triển.')}
        >
          <Ionicons name="receipt-outline" size={18} color={bgColors.subtext} />
          <Text style={[styles.historyLinkText, { color: bgColors.subtext }]}>Xem lịch sử giao dịch</Text>
          <Ionicons name="chevron-forward" size={16} color={bgColors.subtext} />
        </TouchableOpacity>

        {/* Why paid */}
        <Text style={[styles.reasonTitle, { color: bgColors.text }]}>Tại sao nên chọn gói trả phí?</Text>
        <View style={styles.reasonWrapper}>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '500' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1
  },
  notifBtn: { padding: 4 },
  shopIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },

  // Subscription banner
  subBanner: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16,
    padding: 14, borderWidth: 1, marginBottom: 20,
  },
  subBannerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  subBannerSub: { fontSize: 12, fontWeight: '500' },

  // Titles
  mainTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 10, lineHeight: 34 },
  subtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 10 },

  // Duration toggle
  durationToggle: {
    flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 24, alignSelf: 'center',
  },
  durationBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 12, gap: 6,
  },
  durationBtnText: { fontSize: 13, fontWeight: '700' },
  saveBadge: { backgroundColor: '#27AE60', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  saveBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // Plan card
  planCard: {
    borderRadius: 20, padding: 24, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  popularBadge: {
    position: 'absolute', top: -13, alignSelf: 'center',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  popularText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  planLabel: { fontSize: 13, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5 },
  planPrice: { fontSize: 30, fontWeight: '900', marginBottom: 6 },
  planPeriod: { fontSize: 14, fontWeight: '700' },
  yearlyNote: { fontSize: 11, color: '#27AE60', fontWeight: '600', marginBottom: 14 },

  actionBtn: {
    height: 50, borderRadius: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: 8,
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  featureList: { gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 13, fontWeight: '500', flex: 1 },

  // History link
  historyLink: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16,
    borderTopWidth: 1, marginBottom: 24,
  },
  historyLinkText: { flex: 1, fontSize: 14, fontWeight: '500' },

  // Reason section
  reasonTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  reasonWrapper: { gap: 14 },
  reasonCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderRadius: 18, borderWidth: 1 },
  reasonIconWrap: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  reasonTextWrap: { flex: 1 },
  reasonCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  reasonCardDesc: { fontSize: 12, lineHeight: 18 },
});
