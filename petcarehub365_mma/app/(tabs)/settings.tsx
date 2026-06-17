import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { router, useFocusEffect } from 'expo-router';
import petApi from '../../apis/petApi';
import authApi from '../../apis/authApi';

export default function SettingsScreen() {
  const { logout, user: authUser } = useAuth();
  const [user, setUser] = useState<any>(authUser);
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Fetch latest user data
      const meRes = await authApi.getMe() as any;
      if (meRes && meRes.success) {
        setUser(meRes.data.user);
      }
    } catch (error) {
      console.error('Error loading profile screen data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Đăng xuất', 
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  const handleUnderDevelopment = (featureName: string) => {
    Alert.alert('Thông báo', `Tính năng "${featureName}" đang được phát triển. Vui lòng quay lại sau! 🐾`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.settingsIconWrap]}>
          <Ionicons name="settings-sharp" size={20} color="#EC4B4B" />
        </View>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.backBtn}>
          <Ionicons name="notifications-outline" size={22} color="#1B2530" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              {user?.profile?.avatar_url ? (
                <Image source={{ uri: user.profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallbackBg}>
                  <Image source={{ uri: 'https://avatar.iran.liara.run/public/boy' }} style={styles.avatarImage} />
                </View>
              )}
            </View>
            <View style={styles.profileDetails}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={styles.userName}>{user?.profile?.full_name || 'Nguyễn Văn An'}</Text>
                {user?.subscription_plan && user.subscription_plan !== 'FREE' && (
                  <View style={[
                    styles.planBadge,
                    user.subscription_plan === 'VIP' 
                      ? { backgroundColor: '#FFFBEB', borderColor: '#F5C518' } 
                      : { backgroundColor: '#E3F2FD', borderColor: '#0068FF' }
                  ]}>
                    <Text style={[
                      styles.planBadgeText,
                      user.subscription_plan === 'VIP' ? { color: '#D4A017' } : { color: '#0068FF' }
                    ]}>
                      {user.subscription_plan === 'VIP' ? '👑 VIP' : '⭐ Premium'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.userEmail}>{user?.email || 'an.nguyen@petcarehub.vn'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={() => router.push('/profile-edit')}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>

        {/* Section: TÀI KHOẢN */}
        <Text style={styles.sectionLabel}>TÀI KHOẢN</Text>
        <View style={styles.settingsCard}>
          <SettingItem 
            icon="person" 
            title="Thông tin cá nhân" 
            onPress={() => router.push('/profile-edit')} 
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="lock-closed" 
            title="Đổi mật khẩu" 
            onPress={() => router.push('/change-password')} 
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="paw" 
            title="Quản lý gia đình" 
            onPress={() => router.push('/family-management')} 
          />
        </View>

        {/* Section: THÔNG BÁO */}
        <Text style={styles.sectionLabel}>THÔNG BÁO</Text>
        <View style={styles.settingsCard}>
          <SettingItem 
            icon="notifications" 
            title="Thông báo đẩy" 
            rightElement={
              <Switch 
                value={pushEnabled} 
                onValueChange={(val) => setPushEnabled(val)}
                trackColor={{ true: '#EC4B4B', false: '#E4E9F0' }}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="calendar" 
            title="Nhắc nhở lịch trình" 
            onPress={() => router.push('/notifications')} 
          />
        </View>

        {/* Section: ỨNG DỤNG */}
        <Text style={styles.sectionLabel}>ỨNG DỤNG</Text>
        <View style={styles.settingsCard}>
          <SettingItem 
            icon="globe" 
            title="Ngôn ngữ" 
            onPress={() => handleUnderDevelopment('Ngôn ngữ')}
            rightElement={
              <View style={styles.rightContainer}>
                <Text style={styles.rightText}>Tiếng Việt</Text>
                <Ionicons name="chevron-forward" size={18} color="#A5B2C0" />
              </View>
            }
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="moon" 
            title="Chế độ tối" 
            rightElement={
              <Switch 
                value={darkModeEnabled} 
                onValueChange={(val) => setDarkModeEnabled(val)}
                trackColor={{ true: '#EC4B4B', false: '#E4E9F0' }}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="scale" 
            iconType="material"
            title="Đơn vị đo lường" 
            onPress={() => handleUnderDevelopment('Đơn vị đo lường')}
          />
        </View>

        {/* Section: HỖ TRỢ */}
        <Text style={styles.sectionLabel}>HỖ TRỢ</Text>
        <View style={styles.settingsCard}>
          <SettingItem 
            icon="help-circle" 
            title="Trung tâm trợ giúp" 
            onPress={() => handleUnderDevelopment('Trung tâm trợ giúp')} 
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="mail" 
            title="Liên hệ" 
            onPress={() => handleUnderDevelopment('Liên hệ')} 
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="shield-checkmark" 
            title="Điều khoản & Chính sách" 
            onPress={() => handleUnderDevelopment('Điều khoản & Chính sách')} 
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialCommunityIcons name="logout" size={20} color="#EC4B4B" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Build version info */}
        <Text style={styles.versionText}>Phiên bản 2.4.0 (Build 2024)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingItemProps {
  icon: string;
  iconType?: 'ionicons' | 'material' | 'font-awesome';
  title: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingItem({ icon, iconType = 'ionicons', title, onPress, rightElement }: SettingItemProps) {
  const IconComponent = () => {
    if (iconType === 'material') {
      return <MaterialCommunityIcons name={icon as any} size={18} color="#EC4B4B" />;
    } else if (iconType === 'font-awesome') {
      return <FontAwesome5 name={icon as any} size={16} color="#EC4B4B" />;
    }
    return <Ionicons name={icon as any} size={18} color="#EC4B4B" />;
  };

  const Content = (
    <View style={styles.settingItem}>
      <View style={styles.settingIconBg}>
        <IconComponent />
      </View>
      <Text style={styles.settingTitle}>{title}</Text>
      {rightElement !== undefined ? (
        rightElement
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#A5B2C0" />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {Content}
      </TouchableOpacity>
    );
  }

  return <View>{Content}</View>;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAF9F9' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 14 
  },
  backBtn: { 
    padding: 4 
  },
  settingsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1B2530',
    textAlign: 'center'
  },
  content: { 
    paddingHorizontal: 24, 
    paddingBottom: 40 
  },
  profileCard: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#FFEBEB', 
    padding: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.02, 
    shadowRadius: 8, 
    marginBottom: 20,
    marginTop: 10
  },
  profileRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  avatarContainer: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#FFEBEB' 
  },
  avatarFallbackBg: { 
    width: '100%', 
    height: '100%', 
    backgroundColor: '#E2F4E9', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarImage: { 
    width: 64, 
    height: 64, 
    borderRadius: 32 
  },
  profileDetails: { 
    marginLeft: 16, 
    flex: 1 
  },
  userName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1B2530' 
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  userEmail: { 
    fontSize: 13, 
    color: '#8A9AA9', 
    marginTop: 4 
  },
  editBtn: { 
    backgroundColor: '#EC4B4B', 
    borderRadius: 20, 
    paddingVertical: 12, 
    alignItems: 'center', 
    marginTop: 16 
  },
  editBtnText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: 'bold' 
  },
  sectionLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#A5B2C0', 
    letterSpacing: 1.2, 
    marginTop: 20, 
    marginBottom: 8, 
    paddingHorizontal: 4 
  },
  settingsCard: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#FFEBEB', 
    paddingHorizontal: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.01, 
    shadowRadius: 4 
  },
  settingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14 
  },
  settingIconBg: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#FFF0F0', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  settingTitle: { 
    flex: 1, 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#1B2530' 
  },
  rightContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  rightText: { 
    color: '#8A9AA9', 
    fontSize: 13, 
    marginRight: 8 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#FFEBEB' 
  },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    paddingVertical: 16, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#FFD1D1', 
    backgroundColor: '#FFF6F6', 
    marginTop: 30 
  },
  logoutText: { 
    color: '#EC4B4B', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  versionText: { 
    color: '#A5B2C0', 
    fontSize: 11, 
    textAlign: 'center', 
    marginTop: 16, 
    marginBottom: 24 
  }
});
