import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';
  
  const bgColors = {
      main: isDark ? '#000' : '#FAFAFA',
      card: isDark ? '#1c1c1e' : '#fff',
      text: isDark ? '#fff' : '#1a1a1a',
      subtext: isDark ? '#aaa' : '#666',
      border: isDark ? '#333' : '#F0F0F0',
      redBg: isDark ? '#2a1212' : '#FFF5F5',
      redBorder: isDark ? '#4d2020' : '#FFEBEB',
      iconBg: isDark ? '#2c2c2e' : '#F8F8F8'
  };

  const pets = [
    { id: 1, name: 'Mochi', type: 'Corgi', isSelected: true, color: '#FFD1D1' },
    { id: 2, name: 'Luna', type: 'Cat', isSelected: false, color: '#D1E8FF' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColors.main }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: bgColors.card }]}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => Alert.alert('Menu', 'Tính năng Menu mở rộng đang được phát triển.')}>
            <IconSymbol name="line.3.horizontal" size={24} color={bgColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: bgColors.text }]}>PetCare Hub</Text>
        <TouchableOpacity style={styles.bellIcon} onPress={() => router.push('/notifications')}>
          <IconSymbol name="bell.fill" size={22} color={bgColors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: bgColors.text }]}>Thú cưng của bạn</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScroll}>
          {pets.map(pet => (
             <TouchableOpacity key={pet.id} style={styles.petAvatarWrapper}>
                 <View style={[styles.petAvatar, { borderColor: pet.isSelected ? '#FF4D4D' : 'transparent', borderWidth: pet.isSelected ? 2 : 0 }]}>
                    <View style={[styles.petIconPlaceholder, { backgroundColor: pet.color }]}>
                         <IconSymbol name="paw.fill" size={32} color="#fff" />
                    </View>
                 </View>
                 <Text style={[styles.petName, pet.isSelected && styles.petNameSelected, { color: pet.isSelected ? '#FF4D4D' : bgColors.subtext }]}>{pet.name}</Text>
             </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.petAvatarWrapper} onPress={() => router.push('/(setup)/pet-setup-1')}>
              <View style={styles.petAvatar}>
                 <View style={[styles.petIconPlaceholder, { backgroundColor: isDark ? '#222' : '#F0F0F0', borderWidth: 1, borderColor: isDark ? '#444' : '#E5E5E5', borderStyle: 'dashed' }]}>
                      <IconSymbol name="plus" size={24} color={bgColors.subtext} />
                 </View>
              </View>
              <Text style={[styles.petName, { color: bgColors.subtext }]}>Thêm</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={[styles.statusCard, { backgroundColor: bgColors.redBg, borderColor: bgColors.redBorder }]}>
           <Text style={styles.statusMain}>Mochi đang làm rất tốt!</Text>
           <Text style={[styles.statusSub, { color: isDark ? '#ccc' : '#666' }]}>Mochi hoàn thành các nhiệm vụ đúng giờ. Tiếp tục phát huy nhé!</Text>
        </View>

        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: bgColors.text }]}>Nhiệm vụ hằng ngày của Mochi</Text>
            <TouchableOpacity onPress={() => router.push('/mission-detail')}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
        </View>

        {/* Missions List */}
        <TouchableOpacity style={[styles.missionItemDone, { backgroundColor: bgColors.redBg, borderColor: bgColors.redBorder }]} onPress={() => router.push('/mission-detail')}>
            <View style={styles.missionIconDone}><IconSymbol name="fork.knife" size={18} color="#fff" /></View>
            <View style={styles.missionInfo}>
                <Text style={[styles.missionTitleDone, { color: bgColors.subtext }]}>Bữa sáng</Text>
                <Text style={styles.missionTimeDone}>08:00 AM • Hạt & Nước</Text>
            </View>
            <IconSymbol name="checkmark.circle.fill" size={24} color="#FF4D4D" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.missionItem, { backgroundColor: bgColors.card, borderColor: bgColors.border }]} onPress={() => router.push('/mission-detail')}>
            <View style={[styles.missionIcon, { backgroundColor: bgColors.iconBg }]}><IconSymbol name="figure.walk" size={18} color="#4DACFF" /></View>
            <View style={styles.missionInfo}>
                <Text style={[styles.missionTitle, { color: bgColors.text }]}>Đi dạo buổi sáng</Text>
                <Text style={styles.missionTime}>09:30 AM • Khu vườn</Text>
            </View>
            <Text style={styles.percentText}>65%</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.missionItem, { backgroundColor: bgColors.card, borderColor: bgColors.border }]} onPress={() => router.push('/mission-detail')}>
            <View style={[styles.missionIcon, { backgroundColor: bgColors.iconBg }]}><IconSymbol name="scissors" size={18} color="#C462FF" /></View>
            <View style={styles.missionInfo}>
                <Text style={[styles.missionTitle, { color: bgColors.text }]}>Chải lông</Text>
                <Text style={styles.missionTime}>06:00 PM • Chăm sóc lông</Text>
            </View>
            <Text style={styles.percentText}>0%</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  menuIcon: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  bellIcon: { padding: 4 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  petScroll: { flexDirection: 'row', marginBottom: 24 },
  petAvatarWrapper: { alignItems: 'center', marginRight: 16 },
  petAvatar: { padding: 2, borderRadius: 36 },
  petIconPlaceholder: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  petName: { fontSize: 12, marginTop: 8, fontWeight: '500' },
  petNameSelected: { fontWeight: 'bold' },
  statusCard: { borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1 },
  statusMain: { fontSize: 16, fontWeight: 'bold', color: '#FF4D4D', marginBottom: 8 },
  statusSub: { fontSize: 13, lineHeight: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAllText: { fontSize: 12, color: '#FF4D4D', fontWeight: '600' },
  
  missionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
  missionItemDone: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
  missionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  missionIconDone: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFA500', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  missionTitleDone: { fontSize: 14, fontWeight: 'bold', marginBottom: 4, textDecorationLine: 'line-through' },
  missionTime: { fontSize: 12, color: '#999' },
  missionTimeDone: { fontSize: 12, color: '#999' },
  percentText: { fontSize: 12, fontWeight: 'bold', color: '#999' }
});
