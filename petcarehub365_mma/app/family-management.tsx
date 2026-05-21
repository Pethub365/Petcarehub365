import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function FamilyManagementScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Gia đình</Text>
        <TouchableOpacity style={styles.backBtn}><IconSymbol name="questionmark.circle" size={24} color="#FF4D4D" /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.petCard}>
              <View style={styles.petAvatar}><IconSymbol name="paw.fill" size={32} color="#D1E8FF" /></View>
              <View style={styles.petInfo}>
                  <Text style={styles.petName}>Mochi the Corgi</Text>
                  <View style={styles.statusRow}>
                      <IconSymbol name="person.3.fill" size={14} color="#FF4D4D" />
                      <Text style={styles.statusText}>Thành viên chung</Text>
                  </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Thành viên gia đình</Text>
              <TouchableOpacity><IconSymbol name="person.badge.plus" size={20} color="#FF4D4D" /></TouchableOpacity>
          </View>
          
          <View style={styles.memberList}>
             <View style={styles.memberItem}>
                 <View style={styles.memberAvatar}><IconSymbol name="person.fill" size={24} color="#fff" /></View>
                 <View style={styles.memberInfo}>
                     <Text style={styles.memberName}>Nguyễn Trọng Lực</Text>
                     <View style={styles.roleBadge}><Text style={styles.roleTextWrapper}>CHỦ HỘ</Text></View>
                 </View>
                 <IconSymbol name="checkmark.seal.fill" size={20} color="#FF4D4D" />
             </View>

             <View style={styles.divider} />

             <View style={styles.memberItem}>
                 <View style={[styles.memberAvatar, {backgroundColor: '#D1E8FF'}]}><IconSymbol name="person.fill" size={24} color="#fff" /></View>
                 <View style={styles.memberInfo}>
                     <Text style={styles.memberName}>Lê Thu Hà</Text>
                     <Text style={styles.roleTextNorm}>THÀNH VIÊN</Text>
                 </View>
                 <IconSymbol name="ellipsis" size={20} color="#999" style={{transform: [{rotate: '90deg'}]}} />
             </View>
          </View>

          <Text style={styles.sectionTitle}>Tiện ích chung</Text>
          <View style={styles.utilList}>
              <TouchableOpacity style={styles.utilItem} onPress={() => Alert.alert('Điều khiển', 'Mở bảng điều khiển chung')}>
                  <View style={[styles.utilIcon, {backgroundColor: '#FFF3E0'}]}><IconSymbol name="square.grid.2x2.fill" size={20} color="#FF9800" /></View>
                  <View style={styles.utilInfo}>
                      <Text style={styles.utilName}>Bảng điều khiển chung</Text>
                      <Text style={styles.utilDesc}>Xem mọi hoạt động của thú cưng</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={18} color="#ccc" />
              </TouchableOpacity>
              <View style={styles.divider} />

              <TouchableOpacity style={styles.utilItem} onPress={() => Alert.alert('Phân công', 'Xem lịch phân công dọn dẹp')}>
                  <View style={[styles.utilIcon, {backgroundColor: '#E3F2FD'}]}><IconSymbol name="checklist" size={20} color="#2196F3" /></View>
                  <View style={styles.utilInfo}>
                      <Text style={styles.utilName}>Phân công công việc</Text>
                      <Text style={styles.utilDesc}>Chia sẻ lịch chăm sóc, cho ăn</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={18} color="#ccc" />
              </TouchableOpacity>
              <View style={styles.divider} />

              <TouchableOpacity style={styles.utilItem} onPress={() => router.push('/health-dashboard')}>
                  <View style={[styles.utilIcon, {backgroundColor: '#E8F5E9'}]}><IconSymbol name="heart.text.square.fill" size={20} color="#4CAF50" /></View>
                  <View style={styles.utilInfo}>
                      <Text style={styles.utilName}>Hồ sơ sức khỏe chung</Text>
                      <Text style={styles.utilDesc}>Cập nhật lịch tiêm phòng & khám</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={18} color="#ccc" />
              </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.inviteBtn} onPress={() => Alert.alert('Thêm thành viên', 'Chia sẻ mã QR hoặc nhập email người bạn muốn mời.')}>
              <IconSymbol name="envelope.fill" size={16} color="#fff" />
              <Text style={styles.inviteBtnText}>Mời thành viên mới</Text>
          </TouchableOpacity>
          <Text style={styles.infoText}>Người được mời sẽ có quyền truy cập vào hồ sơ của Mochi</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  content: { padding: 20 },
  
  petCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 30 },
  petAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  petInfo: { flex: 1 },
  petName: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 12, color: '#FF4D4D', fontWeight: '500' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a' },
  
  memberList: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 30 },
  memberItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFD1D1', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: '#FF4D4D', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  roleTextWrapper: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  roleTextNorm: { color: '#999', fontSize: 11, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 72 },

  utilList: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 24 },
  utilItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  utilIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  utilInfo: { flex: 1 },
  utilName: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  utilDesc: { fontSize: 12, color: '#999' },
  
  inviteBtn: { backgroundColor: '#FF4D4D', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 18, borderRadius: 24, marginBottom: 12 },
  inviteBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoText: { textAlign: 'center', fontSize: 12, color: '#999' },
});
