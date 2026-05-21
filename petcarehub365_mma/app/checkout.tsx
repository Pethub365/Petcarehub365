import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CheckoutScreen() {
  const [paymentMethod, setPaymentMethod] = useState('card');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.orderCard}>
              <Text style={styles.itemName}>Gói VIP PetCare Hub</Text>
              <Text style={styles.itemPrice}>139.000đ<Text style={styles.itemPeriod}>/tháng</Text></Text>
              <Text style={styles.itemDesc}>Gia hạn tự động hàng tháng</Text>
          </View>

          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentList}>
              {/* Card */}
              <TouchableOpacity style={styles.paymentItem} onPress={() => setPaymentMethod('card')}>
                  <View style={styles.paymentIconWrap}><IconSymbol name="creditcard" size={24} color="#FF4D4D" /></View>
                  <View style={styles.paymentInfo}>
                      <Text style={styles.paymentName}>Thẻ Tín dụng / Ghi nợ</Text>
                      <Text style={styles.paymentDesc}>Visa, Mastercard, JCB</Text>
                  </View>
                  <View style={styles.radioOuter}>
                      {paymentMethod === 'card' && <View style={styles.radioInner} />}
                  </View>
              </TouchableOpacity>
              <View style={styles.divider} />

              {/* MoMo */}
              <TouchableOpacity style={styles.paymentItem} onPress={() => setPaymentMethod('momo')}>
                  <View style={[styles.paymentIconWrap, {backgroundColor: '#A50064'}]}><Text style={{color: '#fff', fontWeight: 'bold'}}>Mo</Text></View>
                  <View style={styles.paymentInfo}>
                      <Text style={styles.paymentName}>Ví MoMo</Text>
                  </View>
                  <View style={styles.radioOuter}>
                      {paymentMethod === 'momo' && <View style={styles.radioInner} />}
                  </View>
              </TouchableOpacity>
              <View style={styles.divider} />

              {/* ZaloPay */}
              <TouchableOpacity style={styles.paymentItem} onPress={() => setPaymentMethod('zalo')}>
                  <View style={[styles.paymentIconWrap, {backgroundColor: '#0068FF'}]}><Text style={{color: '#fff', fontWeight: 'bold'}}>Za</Text></View>
                  <View style={styles.paymentInfo}>
                      <Text style={styles.paymentName}>Ví ZaloPay</Text>
                  </View>
                  <View style={styles.radioOuter}>
                      {paymentMethod === 'zalo' && <View style={styles.radioInner} />}
                  </View>
              </TouchableOpacity>
          </View>

      </ScrollView>

      <View style={styles.footer}>
          <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tạm tính</Text>
              <Text style={styles.totalValue}>139.000đ</Text>
          </View>
          <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, {fontWeight: 'bold', fontSize: 16}]}>Tổng thanh toán</Text>
              <Text style={styles.finalTotal}>139.000đ</Text>
          </View>
          
          <TouchableOpacity style={styles.payBtn} onPress={() => {
              Alert.alert('Thành công', 'Thanh toán thành công. Cảm ơn bạn đăng ký gói VIP!', [
                  {text: 'Về trang chủ', onPress: () => router.push('/(tabs)')}
              ]);
          }}>
              <IconSymbol name="lock.fill" size={16} color="#fff" />
              <Text style={styles.payBtnText}>Xác nhận thanh toán</Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>BẰNG CÁCH NHẤN XÁC NHẬN, BẠN ĐỒNG Ý VỚI ĐIỀU KHOẢN DỊCH VỤ VÀ CHÍNH SÁCH BẢO MẬT CỦA CHÚNG TÔI.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12, marginTop: 10 },
  
  orderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#F0F0F0' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  itemPrice: { fontSize: 20, fontWeight: 'bold', color: '#FF4D4D', marginBottom: 4 },
  itemPeriod: { fontSize: 12, color: '#999' },
  itemDesc: { fontSize: 12, color: '#999' },

  paymentList: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  paymentItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  paymentIconWrap: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  paymentInfo: { flex: 1 },
  paymentName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  paymentDesc: { fontSize: 11, color: '#999' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#FF4D4D', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4D4D' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 72 },

  footer: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#E5E5E5' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 14, color: '#666' },
  totalValue: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' },
  finalTotal: { fontSize: 20, fontWeight: '800', color: '#FF4D4D' },
  payBtn: { backgroundColor: '#FF4D4D', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 18, borderRadius: 24, marginBottom: 16, marginTop: 8 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerNote: { fontSize: 9, color: '#999', textAlign: 'center', lineHeight: 14, paddingHorizontal: 20 }
});
