import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HealthDashboardScreen() {
  const chartWidth = Dimensions.get('window').width - 72;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉ số sức khỏe</Text>
        <TouchableOpacity style={styles.backBtn}><IconSymbol name="gearshape.fill" size={20} color="#1a1a1a" /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.petProfile}>
              <View style={styles.avatarWrap}><IconSymbol name="paw.fill" size={32} color="#ccc" /></View>
              <Text style={styles.petName}>Mochi</Text>
              <Text style={styles.petSub}>2 tuổi • Chó Corgi</Text>
          </View>

          <View style={styles.kpiRow}>
             <View style={styles.kpiCard}>
                <View style={styles.kpiHeader}>
                    <IconSymbol name="figure.walk" size={16} color="#FF4D4D" />
                    <Text style={styles.kpiBadgePos}>+5%</Text>
                </View>
                <Text style={styles.kpiLabel}>Hoạt động</Text>
                <Text style={styles.kpiValue}>45 phút</Text>
             </View>
             
             <View style={styles.kpiCard}>
                <View style={styles.kpiHeader}>
                    <IconSymbol name="moon.fill" size={16} color="#4DACFF" />
                    <Text style={styles.kpiBadgeNeg}>-2%</Text>
                </View>
                <Text style={styles.kpiLabel}>Ngủ</Text>
                <Text style={styles.kpiValue}>9.2 giờ</Text>
             </View>
          </View>

          <View style={styles.analysisCard}>
              <View style={styles.analysisHeader}>
                  <View style={styles.iconCircle}><IconSymbol name="mappin" size={20} color="#fff" /></View>
                  <View style={styles.analysisInfo}>
                      <Text style={styles.analysisTitle}>Phân tích tuần</Text>
                      <Text style={styles.analysisDesc}>Mochi hoạt động nhiều hơn 5% so với tuần trước. Hãy phát huy nhé!</Text>
                  </View>
              </View>
              <TouchableOpacity style={styles.adviceBtn} onPress={() => Alert.alert('Lời khuyên', 'Hãy duy trì thời gian đi dạo mỗi ngày 45 phút để Mochi duy trì cân nặng ổn định.')}>
                  <Text style={styles.adviceBtnText}>Xem mẹo sức khỏe</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.chartHeader}>
             <Text style={styles.sectionTitle}>Xu hướng tăng trưởng</Text>
             <TouchableOpacity onPress={() => Alert.alert('Lọc thời gian', 'Sắp ra mắt')}><Text style={styles.dropdownText}>6 tháng qua v</Text></TouchableOpacity>
          </View>

          <View style={styles.chartCard}>
             <View style={styles.chartTitleRow}>
                 <Text style={styles.chartTitle}>Cân nặng</Text>
                 <Text style={styles.chartStatus}>Mức khỏe mạnh</Text>
             </View>
             <Text style={styles.chartPrimaryVal}>11.4 kg</Text>
             
             <View style={styles.barChartArea}>
                 {/* Mock Bar Chart */}
                 {[40, 50, 55, 65, 70, 90].map((h, i) => (
                    <View key={i} style={styles.barCol}>
                        <View style={[styles.barFill, {height: h, backgroundColor: i === 5 ? '#FF4D4D' : '#FFEBEB'}]} />
                        <Text style={styles.monthText}>{['JAN','FEB','MAR','APR','MAY','JUN'][i]}</Text>
                    </View>
                 ))}
             </View>
          </View>

          <View style={styles.chartCard}>
             <Text style={styles.chartTitle}>Chiều cao</Text>
             <Text style={styles.chartPrimaryVal}>30.5 cm <Text style={styles.chartSubVal}> Tăng trưởng ổn định</Text></Text>
             <View style={styles.lineChartArea}>
                 {/* Mock Line Chart */}
                 <View style={styles.lineMock} />
             </View>
          </View>

          <Text style={styles.sectionTitle}>Chỉ số sinh tồn gần đây</Text>
          <View style={styles.vitalCard}>
              <View style={styles.vitalIcon}><IconSymbol name="heart.fill" size={20} color="#FF4D4D" /></View>
              <View style={styles.vitalInfo}>
                  <Text style={styles.vitalTitle}>Nhịp tim</Text>
                  <Text style={styles.vitalTime}>2 giờ trước</Text>
              </View>
              <Text style={styles.vitalNum}>84 <Text style={styles.vitalUnit}>BPM</Text></Text>
          </View>

          <View style={styles.vitalCard}>
              <View style={styles.vitalIconWrap}><IconSymbol name="thermometer" size={20} color="#4DACFF" /></View>
              <View style={styles.vitalInfo}>
                  <Text style={styles.vitalTitle}>Nhiệt độ</Text>
                  <Text style={styles.vitalTime}>Hôm qua</Text>
              </View>
              <Text style={styles.vitalNum}>38.5 <Text style={styles.vitalUnit}>°C</Text></Text>
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
  content: { padding: 20, paddingBottom: 40 },
  
  petProfile: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFEBEB', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  petName: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  petSub: { fontSize: 13, color: '#FF4D4D', fontWeight: '500' },

  kpiRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  kpiCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 6 },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kpiBadgePos: { backgroundColor: '#E8F5E9', color: '#4CAF50', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  kpiBadgeNeg: { backgroundColor: '#FFEBEE', color: '#FF4D4D', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  kpiLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  kpiValue: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },

  analysisCard: { backgroundColor: '#FFF5F5', borderRadius: 16, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#FFEBEB' },
  analysisHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 16 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF4D4D', justifyContent: 'center', alignItems: 'center' },
  analysisInfo: { flex: 1 },
  analysisTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  analysisDesc: { fontSize: 12, color: '#666', lineHeight: 18 },
  adviceBtn: { backgroundColor: '#FF4D4D', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  adviceBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  dropdownText: { fontSize: 12, color: '#999', fontWeight: '600' },

  chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F0F0F0' },
  chartTitleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  chartTitle: { fontSize: 13, color: '#666', fontWeight: '500' },
  chartStatus: { fontSize: 11, color: '#4CAF50', fontWeight: 'bold' },
  chartPrimaryVal: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginVertical: 8 },
  chartSubVal: { fontSize: 12, color: '#999', fontWeight: 'normal' },

  barChartArea: { height: 120, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
  barCol: { alignItems: 'center', gap: 8 },
  barFill: { width: 30, borderRadius: 4 },
  monthText: { fontSize: 10, color: '#999', fontWeight: '600' },

  lineChartArea: { height: 100, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  lineMock: { width: '100%', height: 2, backgroundColor: '#FF4D4D', transform: [{rotate: '-10deg'}] },

  vitalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  vitalIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  vitalIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  vitalInfo: { flex: 1 },
  vitalTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 },
  vitalTime: { fontSize: 11, color: '#999' },
  vitalNum: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  vitalUnit: { fontSize: 12, color: '#999' },
});
