import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import subscriptionApi from '../apis/subscriptionApi';

export default function CheckoutScreen() {
  const isDark = useColorScheme() === 'dark';
  const { user, refreshUser } = useAuth();
  const {
    packageType = 'MONTHLY',
    planType = 'VIP',
    name = 'Gói VIP Tháng',
    price = '49.000đ',
  } = useLocalSearchParams();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);

  const bgColors = {
    main: isDark ? '#000' : '#FAFAFA',
    card: isDark ? '#1c1c1e' : '#fff',
    text: isDark ? '#fff' : '#1a1a1a',
    subtext: isDark ? '#aaa' : '#666',
    border: isDark ? '#333' : '#FFEBEB',
    qrBg: isDark ? '#2a2a2d' : '#F7F9FC',
    selectedBg: '#FFF0F0',
    selectedBorder: '#EC4B4B',
  };

  // Parse params
  const finalPackageType = (String(packageType).toUpperCase() === 'YEARLY' ? 'YEARLY' : 'MONTHLY') as 'MONTHLY' | 'YEARLY';
  const finalPlanType = (String(planType).toUpperCase() === 'PREMIUM' ? 'PREMIUM' : 'VIP') as 'PREMIUM' | 'VIP';
  const planLabel = finalPlanType === 'VIP' ? 'VIP' : 'Premium';

  const handleConfirmPayment = async () => {
    try {
      setSubmitting(true);
      const res = await subscriptionApi.upgradeSubscription(finalPlanType, finalPackageType, paymentMethod) as any;
      setSubmitting(false);

      if (res && res.success) {
        // Refresh user data so subscription_plan updates immediately
        await refreshUser();
        Alert.alert(
          `Thanh toán thành công! 🌟`,
          res.message || `Cảm ơn bạn đã nâng cấp gói ${planLabel}. Trải nghiệm của bạn đã sẵn sàng!`,
          [
            {
              text: 'Bắt đầu ngay',
              onPress: () => { router.replace('/(tabs)/shop'); }
            }
          ]
        );
      } else {
        Alert.alert('Thất bại', res?.message || 'Không thể xác nhận giao dịch. Vui lòng thử lại sau.');
      }
    } catch (error: any) {
      setSubmitting(false);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || `Có lỗi xảy ra khi xử lý nâng cấp gói ${planLabel}. Vui lòng thử lại.`
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColors.main }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: bgColors.card, borderBottomColor: bgColors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={bgColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: bgColors.text }]}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: bgColors.text }]}>Tóm tắt đơn hàng</Text>
        <View style={[styles.orderCard, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
          <Text style={[styles.itemName, { color: bgColors.text }]}>{name}</Text>
          <Text style={[styles.itemSubName, { color: '#EC4B4B' }]}>{price}/{finalPackageType === 'YEARLY' ? 'năm' : 'tháng'}</Text>
          <Text style={styles.itemDesc}>{finalPackageType === 'YEARLY' ? 'Gia hạn tự động hàng năm' : 'Gia hạn tự động hàng tháng'}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: bgColors.text }]}>Phương thức thanh toán</Text>
        <View style={styles.paymentContainer}>
          {/* Card Option */}
          <TouchableOpacity 
            style={[
              styles.paymentCard, 
              { backgroundColor: bgColors.card, borderColor: bgColors.border },
              paymentMethod === 'card' && { backgroundColor: bgColors.selectedBg, borderColor: bgColors.selectedBorder }
            ]} 
            onPress={() => setPaymentMethod('card')}
            activeOpacity={0.9}
          >
            <View style={[styles.paymentIconWrap, { backgroundColor: '#FFF0F0' }]}>
              <IconSymbol name="creditcard" size={20} color="#EC4B4B" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentName, { color: bgColors.text }]}>Thẻ tín dụng / Ghi nợ</Text>
              <Text style={styles.paymentDesc}>Visa, Mastercard, JCB</Text>
            </View>
            <View style={[styles.radioOuter, paymentMethod === 'card' && { borderColor: '#EC4B4B' }]}>
              {paymentMethod === 'card' && <View style={[styles.radioInner, { backgroundColor: '#EC4B4B' }]} />}
            </View>
          </TouchableOpacity>

          {/* MoMo Option */}
          <TouchableOpacity 
            style={[
              styles.paymentCard, 
              { backgroundColor: bgColors.card, borderColor: bgColors.border },
              paymentMethod === 'momo' && { backgroundColor: bgColors.selectedBg, borderColor: bgColors.selectedBorder }
            ]} 
            onPress={() => setPaymentMethod('momo')}
            activeOpacity={0.9}
          >
            <View style={[styles.paymentIconWrap, { backgroundColor: '#A50064' }]}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>momo</Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentName, { color: bgColors.text }]}>Ví MoMo</Text>
            </View>
            <View style={[styles.radioOuter, paymentMethod === 'momo' && { borderColor: '#EC4B4B' }]}>
              {paymentMethod === 'momo' && <View style={[styles.radioInner, { backgroundColor: '#EC4B4B' }]} />}
            </View>
          </TouchableOpacity>

          {/* ZaloPay Option */}
          <TouchableOpacity 
            style={[
              styles.paymentCard, 
              { backgroundColor: bgColors.card, borderColor: bgColors.border },
              paymentMethod === 'zalopay' && { backgroundColor: bgColors.selectedBg, borderColor: bgColors.selectedBorder }
            ]} 
            onPress={() => setPaymentMethod('zalopay')}
            activeOpacity={0.9}
          >
            <View style={[styles.paymentIconWrap, { backgroundColor: '#0084FF' }]}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 9 }}>ZaloPay</Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentName, { color: bgColors.text }]}>Ví ZaloPay</Text>
            </View>
            <View style={[styles.radioOuter, paymentMethod === 'zalopay' && { borderColor: '#EC4B4B' }]}>
              {paymentMethod === 'zalopay' && <View style={[styles.radioInner, { backgroundColor: '#EC4B4B' }]} />}
            </View>
          </TouchableOpacity>

          {/* VietQR Option */}
          <TouchableOpacity 
            style={[
              styles.paymentCard, 
              { backgroundColor: bgColors.card, borderColor: bgColors.border },
              paymentMethod === 'vietqr' && { backgroundColor: bgColors.selectedBg, borderColor: bgColors.selectedBorder }
            ]} 
            onPress={() => setPaymentMethod('vietqr')}
            activeOpacity={0.9}
          >
            <View style={[styles.paymentIconWrap, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="qr-code" size={20} color="#0068FF" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentName, { color: bgColors.text }]}>Chuyển khoản VietQR</Text>
              <Text style={styles.paymentDesc}>Quét mã QR qua ứng dụng Ngân hàng</Text>
            </View>
            <View style={[styles.radioOuter, paymentMethod === 'vietqr' && { borderColor: '#EC4B4B' }]}>
              {paymentMethod === 'vietqr' && <View style={[styles.radioInner, { backgroundColor: '#EC4B4B' }]} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Dynamic Payment instruction card for VietQR */}
        {paymentMethod === 'vietqr' && (
          <View style={[styles.vietQrCard, { backgroundColor: bgColors.qrBg, borderColor: bgColors.border }]}>
            <View style={styles.vietQrHeader}>
              <Text style={styles.vietQrHeaderTitle}>VietQR CHUYỂN KHOẢN NHANH</Text>
              <View style={styles.mbLogo}><Text style={styles.mbLogoText}>MB Bank</Text></View>
            </View>

            <View style={styles.qrVisualContainer}>
              {/* Beautiful representation of QR code with scanner frame */}
              <View style={styles.qrScannerFrame}>
                <View style={styles.qrInternalSquare}>
                  {/* Decorative QR code block alignment symbols */}
                  <View style={[styles.qrDot, { top: 6, left: 6 }]} />
                  <View style={[styles.qrDot, { top: 6, right: 6 }]} />
                  <View style={[styles.qrDot, { bottom: 6, left: 6 }]} />
                  
                  {/* Central Pet icon representing brand */}
                  <View style={styles.qrCenterLogo}>
                    <IconSymbol name="paw.fill" size={18} color="#EC4B4B" />
                  </View>
                  
                  {/* Random pixels decorative lines */}
                  <View style={styles.qrPixelArt} />
                </View>
              </View>
              <Text style={styles.qrScanInstruction}>Quét mã QR để tự động điền thông tin</Text>
            </View>

            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>Ngân hàng thụ hưởng</Text>
              <Text style={[styles.bankDetailVal, { color: bgColors.text }]}>MB Bank (Ngân hàng Quân Đội)</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>Số tài khoản</Text>
              <Text style={[styles.bankDetailVal, { color: bgColors.text, fontWeight: 'bold' }]}>36588889999</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>Tên tài khoản</Text>
              <Text style={[styles.bankDetailVal, { color: bgColors.text, textTransform: 'uppercase' }]}>CONG TY CO PHAN PETCAREHUB365</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>Số tiền chuyển</Text>
              <Text style={[styles.bankDetailVal, { color: '#EC4B4B', fontWeight: 'bold' }]}>{price}</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>Nội dung bắt buộc</Text>
              <Text style={[styles.bankDetailVal, { color: '#0068FF', fontWeight: 'bold' }]}>
                PETCARE365 VIP {user?.email ? user.email.split('@')[0] : 'USER'}
              </Text>
            </View>
            
            <Text style={styles.qrWarningNote}>
              * Lưu ý: Hãy nhập chính xác nội dung chuyển khoản để hệ thống kích hoạt tự động sau 1-3 phút.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: bgColors.card, borderTopColor: bgColors.border }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: bgColors.subtext }]}>Tạm tính</Text>
          <Text style={[styles.totalValue, { color: bgColors.text }]}>{price}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { fontWeight: 'bold', fontSize: 15, color: bgColors.text }]}>Tổng thanh toán</Text>
          <Text style={styles.finalTotal}>{price}</Text>
        </View>
        
        <TouchableOpacity style={styles.payBtn} onPress={handleConfirmPayment} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <IconSymbol name="lock.fill" size={16} color="#fff" />
              <Text style={styles.payBtnText}>Xác nhận thanh toán</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          BẰNG CÁCH NHẤN XÁC NHẬN, BẠN ĐỒNG Ý VỚI ĐIỀU KHOẢN DỊCH VỤ VÀ CHÍNH SÁCH BẢO MẬT CỦA PETCAREHUB365.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12, marginTop: 10 },
  
  orderCard: { borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  itemSubName: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  itemPrice: { fontSize: 24, fontWeight: '900', color: '#FF4D4D', marginBottom: 6 },
  itemPeriod: { fontSize: 14, fontWeight: 'bold', color: '#999' },
  itemDesc: { fontSize: 11, color: '#999', lineHeight: 16 },

  paymentContainer: { gap: 12, marginBottom: 24 },
  paymentCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.01, shadowRadius: 4, elevation: 1 },
  paymentIconWrap: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  paymentInfo: { flex: 1 },
  paymentName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  paymentDesc: { fontSize: 11, color: '#999' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E4E9F0', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EC4B4B' },

  // VietQR visual styles
  vietQrCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 24 },
  vietQrHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', paddingBottom: 12, marginBottom: 16 },
  vietQrHeaderTitle: { fontSize: 11, fontWeight: '900', color: '#0068FF', letterSpacing: 1 },
  mbLogo: { backgroundColor: '#1A237E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  mbLogoText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  qrVisualContainer: { alignItems: 'center', marginVertical: 10, marginBottom: 20 },
  qrScannerFrame: { padding: 10, borderWidth: 2, borderColor: '#0068FF', borderRadius: 16, borderStyle: 'dashed' },
  qrInternalSquare: { width: 130, height: 130, backgroundColor: '#fff', borderRadius: 8, position: 'relative', overflow: 'hidden' },
  qrDot: { width: 26, height: 26, borderWidth: 6, borderColor: '#1a1a1a', borderRadius: 4, position: 'absolute' },
  qrCenterLogo: { position: 'absolute', top: 51, left: 51, width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FF4D4D', zIndex: 10 },
  qrPixelArt: { width: '100%', height: '100%', opacity: 0.1, backgroundColor: '#000' }, // fallback for texture
  qrScanInstruction: { fontSize: 11, color: '#777', fontWeight: '500', marginTop: 10 },
  bankDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)' },
  bankDetailLabel: { fontSize: 12, color: '#888' },
  bankDetailVal: { fontSize: 12, fontWeight: '600' },
  qrWarningNote: { fontSize: 11, color: '#F57C00', marginTop: 16, lineHeight: 18, fontStyle: 'italic' },

  footer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30, borderTopWidth: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 13 },
  totalValue: { fontSize: 13, fontWeight: 'bold' },
  finalTotal: { fontSize: 22, fontWeight: '900', color: '#FF4D4D' },
  payBtn: { backgroundColor: '#FF4D4D', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 18, borderRadius: 24, marginBottom: 16, marginTop: 8 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerNote: { fontSize: 9, color: '#999', textAlign: 'center', lineHeight: 14, paddingHorizontal: 20 }
});
