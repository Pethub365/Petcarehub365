import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Appearance, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { logout } = useAuth();
  
  const [pushNoti, setPushNoti] = React.useState(true);
  
  // DARK MODE HOOKS
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const bgColors = {
      main: isDark ? '#000' : '#FAFAFA',
      card: isDark ? '#1c1c1e' : '#fff',
      text: isDark ? '#fff' : '#1a1a1a',
      subtext: isDark ? '#999' : '#666',
      border: isDark ? '#333' : '#F0F0F0',
      iconBg: isDark ? '#2c2c2e' : '#F8F8F8'
  };

  const toggleDarkMode = () => {
     Appearance.setColorScheme(isDark ? 'light' : 'dark');
  };

  const handleLogout = async () => {
      await logout();
      router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColors.main }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: bgColors.card }]}>
        <IconSymbol name="chevron.right" size={24} color={bgColors.text} style={{ transform: [{ rotate: '180deg' }] }} opacity={0} />
        <Text style={[styles.headerTitle, { color: bgColors.text }]}>Cài đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Info Card */}
          <View style={[styles.userCard, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
              <View style={styles.avatarWrap}>
                  <IconSymbol name="person.fill" size={32} color="#fff" />
              </View>
              <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: bgColors.text }]}>Nguyễn Văn An</Text>
                  <Text style={[styles.userEmail, { color: bgColors.subtext }]}>an.nguyen@petcarehub.vn</Text>
                  <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/profile-edit')}>
                      <Text style={styles.editBtnText}>Chỉnh sửa</Text>
                  </TouchableOpacity>
              </View>
          </View>

          {/* Tài khoản */}
          <Text style={[styles.sectionTitle, { color: bgColors.subtext }]}>TÀI KHOẢN</Text>
          <View style={[styles.card, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
              <SettingItem icon="person.fill" title="Thông tin cá nhân" iconColor="#FF4D4D" onPress={() => router.push('/profile-edit')} isDark={isDark} bgColors={bgColors} />
              <View style={[styles.divider, { backgroundColor: bgColors.border }]} />
              <SettingItem icon="lock.fill" title="Đổi mật khẩu" iconColor="#FF4D4D" onPress={() => router.push('/change-password')} isDark={isDark} bgColors={bgColors} />
              <View style={[styles.divider, { backgroundColor: bgColors.border }]} />
              <SettingItem icon="paw.fill" title="Quản lý gia đình (Pets)" iconColor="#FF4D4D" onPress={() => router.push('/family-management')} isDark={isDark} bgColors={bgColors} />
          </View>

          {/* Thông báo */}
          <Text style={[styles.sectionTitle, { color: bgColors.subtext }]}>THÔNG BÁO</Text>
          <View style={[styles.card, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
              <SettingItem icon="bell.fill" title="Thông báo đẩy" iconColor="#FF9800" isToggle toggleValue={pushNoti} onToggle={() => setPushNoti(!pushNoti)} isDark={isDark} bgColors={bgColors} />
              <View style={[styles.divider, { backgroundColor: bgColors.border }]} />
              <SettingItem icon="calendar" title="Nhắc nhở lịch trình" iconColor="#FF9800" onPress={() => Alert.alert('Lịch trình', 'Đã lưu thiết lập vào calendar trên máy')} isDark={isDark} bgColors={bgColors} />
          </View>

          {/* Ứng dụng */}
          <Text style={[styles.sectionTitle, { color: bgColors.subtext }]}>ỨNG DỤNG</Text>
          <View style={[styles.card, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
              <SettingItem icon="globe" title="Ngôn ngữ" iconColor="#4DACFF" valueText="Tiếng Việt" onPress={() => Alert.alert('Ngôn ngữ', 'Đang cập nhật thêm ngôn ngữ Anh/Pháp')} isDark={isDark} bgColors={bgColors} />
              <View style={[styles.divider, { backgroundColor: bgColors.border }]} />
              
              <SettingItem icon="moon.fill" title="Chế độ tối" iconColor="#4DACFF" isToggle toggleValue={isDark} onToggle={toggleDarkMode} isDark={isDark} bgColors={bgColors} />
              
              <View style={[styles.divider, { backgroundColor: bgColors.border }]} />
              <SettingItem icon="ruler.fill" title="Đơn vị đo lường" iconColor="#4DACFF" onPress={() => Alert.alert('Đơn vị', 'Đã chuyển thành kg/cm mặc định')} isDark={isDark} bgColors={bgColors} />
          </View>

          {/* Hỗ trợ */}
          <Text style={[styles.sectionTitle, { color: bgColors.subtext }]}>HỖ TRỢ</Text>
          <View style={[styles.card, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
              <SettingItem icon="questionmark.circle.fill" title="Trung tâm trợ giúp" iconColor="#66BB6A" onPress={() => Alert.alert('Trợ giúp', 'Chuyển tới tổng đài trợ giúp...')} isDark={isDark} bgColors={bgColors} />
              <View style={[styles.divider, { backgroundColor: bgColors.border }]} />
              <SettingItem icon="envelope.fill" title="Liên hệ" iconColor="#66BB6A" onPress={() => Alert.alert('Liên hệ', 'Mở tiện ích gửi mail phản hồi...')} isDark={isDark} bgColors={bgColors} />
              <View style={[styles.divider, { backgroundColor: bgColors.border }]} />
              <SettingItem icon="doc.text.fill" title="Điều khoản & Chính sách" iconColor="#66BB6A" onPress={() => Alert.alert('Pháp lý', 'Điều khoản sử dụng của PetCare Hub')} isDark={isDark} bgColors={bgColors} />
          </View>

          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: bgColors.card, borderColor: bgColors.border }]} onPress={handleLogout}>
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FF4D4D" />
              <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
          <Text style={[styles.versionText, { color: bgColors.subtext }]}>Phiên bản 2.4.0 (Build 2024)</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

function SettingItem({ icon, title, isToggle, toggleValue, onToggle, valueText, iconColor, onPress, isDark, bgColors }: any) {
    return (
        <TouchableOpacity style={styles.settingItem} activeOpacity={isToggle ? 1 : 0.7} onPress={isToggle ? onToggle : onPress}>
            <View style={[styles.settingIconBg, { backgroundColor: isDark ? `${iconColor}30` : `${iconColor}15` }]}>
                <IconSymbol name={icon} size={18} color={iconColor} />
            </View>
            <Text style={[styles.settingTitle, { color: bgColors.text }]}>{title}</Text>
            {valueText && <Text style={[styles.settingValueText, { color: bgColors.subtext }]}>{valueText}</Text>}
            {isToggle ? (
                <View style={[styles.toggleBg, toggleValue && styles.toggleBgActive, { backgroundColor: toggleValue ? '#FF4D4D' : (isDark ? '#444' : '#E5E5E5') }]}>
                    <View style={[styles.toggleKnob, toggleValue && styles.toggleKnobActive]} />
                </View>
            ) : (
                <IconSymbol name="chevron.right" size={20} color={isDark ? '#666' : '#ccc'} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  
  userCard: { flexDirection: 'row', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, alignItems: 'center' },
  avatarWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFD1D1', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { fontSize: 13, marginBottom: 12 },
  editBtn: { backgroundColor: '#FF4D4D', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 16 },
  editBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 8 },
  card: { borderRadius: 16, paddingHorizontal: 16, marginBottom: 24, borderWidth: 1 },
  divider: { height: 1, marginLeft: 44 },
  
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  settingIconBg: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingTitle: { flex: 1, fontSize: 15, fontWeight: '500' },
  settingValueText: { fontSize: 13, marginRight: 8 },
  
  toggleBg: { width: 44, height: 24, borderRadius: 12, padding: 2 },
  toggleBgActive: { backgroundColor: '#FF4D4D' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleKnobActive: { transform: [{translateX: 20}] },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, borderWidth: 1, marginTop: 10, marginBottom: 24 },
  logoutText: { color: '#FF4D4D', fontSize: 16, fontWeight: 'bold' },
  versionText: { textAlign: 'center', fontSize: 12, marginBottom: 40 }
});
