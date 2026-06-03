import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import petApi from '../../apis/petApi';

export default function PetSetup2Screen() {
  const params = useLocalSearchParams();
  const [healthStatus, setHealthStatus] = useState('NORMAL');
  const [activity, setActivity] = useState('Bình thường');
  const [feedReminder, setFeedReminder] = useState(true);
  const [walkReminder, setWalkReminder] = useState(true);
  const [vetReminder, setVetReminder] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', String(params.name || ''));
      formData.append('species', String(params.species || 'OTHER'));
      formData.append('breed', String(params.breed || ''));
      formData.append('weight', String(params.weight || '0'));
      formData.append('gender', String(params.gender || 'UNKNOWN'));
      
      // Clean dob date string
      let cleanDob = String(params.dob || '').trim();
      if (cleanDob) {
        const parts = cleanDob.split(/[./-]/);
        if (parts.length === 3) {
          if (parts[2].length === 4) {
            // D.M.YYYY -> YYYY-MM-DD
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            cleanDob = `${year}-${month}-${day}`;
          } else if (parts[0].length === 4) {
            // YYYY-MM-DD -> YYYY-MM-DD
            const year = parts[0];
            const month = parts[1].padStart(2, '0');
            const day = parts[2].padStart(2, '0');
            cleanDob = `${year}-${month}-${day}`;
          }
        }
      } else {
        cleanDob = new Date().toISOString().split('T')[0];
      }
      formData.append('dob', cleanDob);
      formData.append('health_status', healthStatus);

      if (params.avatarUri) {
        const avatarUri = String(params.avatarUri);
        const uriParts = avatarUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('avatar', {
          uri: Platform.OS === 'ios' ? avatarUri.replace('file://', '') : avatarUri,
          name: `pet_avatar.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      // Gọi API tạo thú cưng
      const response = await petApi.createPet(formData) as any;

      if (response && response.success) {
        const newPet = response.data.pet;
        await require('../../utils/storage').setStorageItem('selectedPetId', newPet._id);
        
        router.push({
          pathname: '/(setup)/ai-analyzing',
          params: {
            petName: newPet.name,
            species: newPet.species
          }
        });
      } else {
        Alert.alert('Thất bại', response.message || 'Không thể tạo hồ sơ thú cưng.');
      }
    } catch (error: any) {
      console.error('Error creating pet:', error);
      Alert.alert('Lỗi', error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo thú cưng.');
    } finally {
      setLoading(false);
    }
  };

  // Custom switch component
  const CustomSwitch = ({ value, onValueChange }: { value: boolean, onValueChange: (v: boolean) => void }) => {
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => onValueChange(!value)}
        style={[
          styles.switchBg, 
          value ? styles.switchBgActive : styles.switchBgInactive
        ]}
      >
        <View style={[styles.switchKnob, value ? styles.switchKnobActive : styles.switchKnobInactive]} />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#1A2530" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sức khỏe & Thói quen</Text>
            <View style={{ width: 24 }} />
        </View>

        <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.activeDot]} />
            <View style={[styles.progressDot, styles.activeDot]} />
        </View>
        <Text style={styles.stepText}>Step 2 of 2</Text>

        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Ionicons name="medical" size={16} color="#EC4B4B" />
                <Text style={styles.sectionTitle}>Tình trạng sức khỏe</Text>
            </View>
            <View style={styles.card}>
                {/* 1. Khỏe mạnh */}
                <TouchableOpacity 
                    style={[styles.healthItem, healthStatus === 'NORMAL' && styles.healthItemActive]} 
                    onPress={() => setHealthStatus('NORMAL')}
                >
                    <View style={[styles.iconCircleWrap, { backgroundColor: '#FFF0F0' }]}>
                        <Ionicons name="happy" size={20} color="#EC4B4B" />
                    </View>
                    <View style={styles.healthInfo}>
                        <Text style={[styles.healthTitle, healthStatus === 'NORMAL' && styles.activeHealthTitle]}>Khỏe mạnh</Text>
                        <Text style={styles.healthDesc}>Đã được kiểm tra đầy đủ và cập nhật.</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.healthDivider} />

                {/* 2. Thừa cân */}
                <TouchableOpacity 
                    style={[styles.healthItem, healthStatus === 'OVERWEIGHT' && styles.healthItemActive]} 
                    onPress={() => setHealthStatus('OVERWEIGHT')}
                >
                    <View style={[styles.iconCircleWrap, { backgroundColor: '#FFF0F0' }]}>
                        <Ionicons name="trending-up" size={20} color="#EC4B4B" />
                    </View>
                    <View style={styles.healthInfo}>
                        <Text style={[styles.healthTitle, healthStatus === 'OVERWEIGHT' && styles.activeHealthTitle]}>Thừa cân (Overweight)</Text>
                        <Text style={styles.healthDesc}>Cần kiểm soát calo và tăng cường vận động.</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.healthDivider} />

                {/* 3. Thiếu cân */}
                <TouchableOpacity 
                    style={[styles.healthItem, healthStatus === 'UNDERWEIGHT' && styles.healthItemActive]} 
                    onPress={() => setHealthStatus('UNDERWEIGHT')}
                >
                    <View style={[styles.iconCircleWrap, { backgroundColor: '#FFF6E9' }]}>
                        <Ionicons name="trending-down" size={20} color="#FFA500" />
                    </View>
                    <View style={styles.healthInfo}>
                        <Text style={[styles.healthTitle, healthStatus === 'UNDERWEIGHT' && styles.activeHealthTitleOrange]}>Thiếu cân (Underweight)</Text>
                        <Text style={styles.healthDesc}>Cần bổ sung các cữ ăn phụ và men tiêu hóa.</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.healthDivider} />

                {/* 4. Yêu cầu chăm sóc */}
                <TouchableOpacity 
                    style={[styles.healthItem, healthStatus === 'SICK' && styles.healthItemActive]} 
                    onPress={() => setHealthStatus('SICK')}
                >
                    <View style={[styles.iconCircleWrap, { backgroundColor: '#FFF6E9' }]}>
                        <Ionicons name="alert-circle" size={20} color="#FFA500" />
                    </View>
                    <View style={styles.healthInfo}>
                        <Text style={[styles.healthTitle, healthStatus === 'SICK' && styles.activeHealthTitleOrange]}>Yêu cầu chăm sóc (Ốm)</Text>
                        <Text style={styles.healthDesc}>Các vấn đề nhỏ hoặc cần kiểm tra sức khỏe.</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.healthDivider} />

                {/* 5. Điều trị y tế */}
                <TouchableOpacity 
                    style={[styles.healthItem, healthStatus === 'POST_SURGERY' && styles.healthItemActive]} 
                    onPress={() => setHealthStatus('POST_SURGERY')}
                >
                    <View style={[styles.iconCircleWrap, { backgroundColor: '#FFF0F0' }]}>
                        <Ionicons name="medical-sharp" size={20} color="#EC4B4B" />
                    </View>
                    <View style={styles.healthInfo}>
                        <Text style={[styles.healthTitle, healthStatus === 'POST_SURGERY' && styles.activeHealthTitle]}>Điều trị y tế (Sau phẫu thuật)</Text>
                        <Text style={styles.healthDesc}>Hỗ trợ y tế liên tục.</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Ionicons name="flash" size={16} color="#EC4B4B" />
                <Text style={styles.sectionTitle}>Mức độ hoạt động</Text>
            </View>
            <View style={styles.card}>
                 <View style={styles.sliderContainer}>
                     <View style={styles.sliderTrack} />
                     {/* Positional checkmark based on active selection */}
                     <View style={[
                         styles.sliderCheckmark, 
                         activity === 'Chậm' && { left: '15%' },
                         activity === 'Bình thường' && { left: '50%' },
                         activity === 'Cao' && { left: '85%' }
                     ]}>
                         <Ionicons name="checkmark" size={12} color="#fff" />
                     </View>
                 </View>
                 <View style={styles.activityRow}>
                    <TouchableOpacity onPress={() => setActivity('Chậm')} style={styles.activityItem} activeOpacity={0.7}>
                        <Ionicons name="leaf" size={24} color={activity === 'Chậm' ? '#8A9AA9' : '#8A9AA9'} style={activity === 'Chậm' && styles.activeIcon} />
                        <Text style={[styles.activityText, activity === 'Chậm' && styles.activityTextActive]}>Chậm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActivity('Bình thường')} style={styles.activityItem} activeOpacity={0.7}>
                        <FontAwesome5 name="running" size={24} color={activity === 'Bình thường' ? '#EC4B4B' : '#8A9AA9'} />
                        <Text style={[styles.activityText, activity === 'Bình thường' && styles.activityTextActive]}>Bình thường</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActivity('Cao')} style={styles.activityItem} activeOpacity={0.7}>
                        <Ionicons name="flash" size={24} color={activity === 'Cao' ? '#8A9AA9' : '#8A9AA9'} style={activity === 'Cao' && styles.activeIcon} />
                        <Text style={[styles.activityText, activity === 'Cao' && styles.activityTextActive]}>Cao</Text>
                    </TouchableOpacity>
                 </View>
            </View>
        </View>

        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Ionicons name="notifications" size={16} color="#EC4B4B" />
                <Text style={styles.sectionTitle}>Nhắc nhở mỗi ngày</Text>
            </View>
            
            <View style={styles.reminderItem}>
                <View style={[styles.reminderIconWrap, { backgroundColor: '#FFF6E9' }]}>
                    <Ionicons name="restaurant" size={20} color="#FFA500" />
                </View>
                <Text style={styles.reminderTitle}>Giờ cho thú cưng ăn</Text>
                <CustomSwitch value={feedReminder} onValueChange={setFeedReminder} />
            </View>

            <View style={styles.reminderItem}>
                <View style={[styles.reminderIconWrap, { backgroundColor: '#EBF3FF' }]}>
                    <Ionicons name="map" size={20} color="#4DACFF" />
                </View>
                <Text style={styles.reminderTitle}>Giờ dắt đi dạo</Text>
                <CustomSwitch value={walkReminder} onValueChange={setWalkReminder} />
            </View>

            <View style={styles.reminderItem}>
                <View style={[styles.reminderIconWrap, { backgroundColor: '#F9EFFF' }]}>
                    <Ionicons name="calendar" size={20} color="#C462FF" />
                </View>
                <Text style={styles.reminderTitle}>Lịch khám</Text>
                <CustomSwitch value={vetReminder} onValueChange={setVetReminder} />
            </View>
        </View>

        <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.9}
        >
            <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{loading ? 'Đang lưu...' : 'Hoàn thành'}</Text>
                <View style={styles.starBadge}>
                    <Ionicons name="star" size={12} color="#fff" />
                </View>
            </View>
        </TouchableOpacity>
        <Text style={styles.rewardText}>+50 XP & 10 COINS REWARD</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F9' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B2530', textAlign: 'center' },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  progressDot: { width: 28, height: 6, borderRadius: 3 },
  activeDot: { backgroundColor: '#EC4B4B' },
  stepText: { textAlign: 'center', fontSize: 12, color: '#8A9AA9', fontWeight: '500', marginBottom: 24 },
  
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1B2530' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#FFEBEB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.01, shadowRadius: 8, elevation: 1 },
  
  healthItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 4 },
  healthItemActive: { backgroundColor: '#FFFDFD', borderRadius: 16 },
  iconCircleWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  healthInfo: { flex: 1 },
  healthTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B2530', marginBottom: 4 },
  activeHealthTitle: { color: '#EC4B4B' },
  activeHealthTitleOrange: { color: '#FFA500' },
  healthDesc: { fontSize: 12, color: '#8A9AA9', lineHeight: 18, fontWeight: '500' },
  healthDivider: { height: 1, backgroundColor: '#FFEBEB', marginVertical: 14 },
  
  sliderContainer: { height: 32, justifyContent: 'center', marginHorizontal: 24, position: 'relative' },
  sliderTrack: { height: 6, backgroundColor: '#F0F2F4', borderRadius: 3 },
  sliderCheckmark: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#EC4B4B', justifyContent: 'center', alignItems: 'center', position: 'absolute', transform: [{ translateX: -10 }] },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 8 },
  activityItem: { alignItems: 'center', gap: 6, width: 80 },
  activeIcon: { color: '#8A9AA9' },
  activityText: { fontSize: 12, color: '#8A9AA9', fontWeight: 'bold' },
  activityTextActive: { color: '#EC4B4B' },

  reminderItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#FFEBEB' },
  reminderIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reminderTitle: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#1B2530' },

  switchBg: { width: 52, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center', borderWidth: 1, borderColor: '#FFEBEB' },
  switchBgActive: { backgroundColor: '#EC4B4B', borderColor: '#EC4B4B' },
  switchBgInactive: { backgroundColor: '#fff' },
  switchKnob: { width: 22, height: 22, borderRadius: 11 },
  switchKnobActive: { backgroundColor: '#fff', alignSelf: 'flex-end' },
  switchKnobInactive: { backgroundColor: '#EC4B4B', alignSelf: 'flex-start' },

  button: { backgroundColor: '#EC4B4B', borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginTop: 12, shadowColor: '#EC4B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  starBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#1A2530', justifyContent: 'center', alignItems: 'center' },
  rewardText: { textAlign: 'center', color: '#8A9AA9', fontSize: 11, fontWeight: 'bold', marginTop: 8, letterSpacing: 0.5 },
});
