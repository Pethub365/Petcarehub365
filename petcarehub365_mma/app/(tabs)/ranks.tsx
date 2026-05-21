import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function RanksScreen() {
  const [tab, setTab] = useState('Xếp hạng');

  const topUsers = [
    { rank: 2, name: 'Oliver', points: '2,840', color: '#silver' },
    { rank: 1, name: 'Cooper', points: '3,120', color: '#FFD700', isFirst: true },
    { rank: 3, name: 'Luna', points: '2,610', color: '#cd7f32' },
  ];

  const others = [
    { rank: 4, name: 'Bella', points: '2,450' },
    { rank: 5, name: 'Milo', points: '2,380' },
    { rank: 6, name: 'Bibi', points: '2,100' },
    { rank: 7, name: 'Rocky', points: '1,950' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} opacity={0} />
        <Text style={styles.headerTitle}>Bảng xếp hạng</Text>
        <IconSymbol name="trophy.fill" size={20} color="#FF4D4D" />
      </View>

      <View style={styles.tabContainer}>
         <TouchableOpacity style={[styles.tabBtn, tab === 'Huy hiệu' && styles.activeTab]} onPress={() => setTab('Huy hiệu')}>
             <Text style={[styles.tabText, tab === 'Huy hiệu' && styles.activeTabText]}>Huy hiệu</Text>
         </TouchableOpacity>
         <TouchableOpacity style={[styles.tabBtn, tab === 'Xếp hạng' && styles.activeTab]} onPress={() => setTab('Xếp hạng')}>
             <Text style={[styles.tabText, tab === 'Xếp hạng' && styles.activeTabText]}>Xếp hạng</Text>
         </TouchableOpacity>
      </View>

      <View style={styles.subTabContainer}>
         <TouchableOpacity><Text style={[styles.subTabText, styles.subTabActive]}>Tuần</Text></TouchableOpacity>
         <TouchableOpacity><Text style={styles.subTabText}>Tháng</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Top 3 Podium */}
          <View style={styles.podium}>
              {topUsers.map((user, index) => (
                  <View key={user.name} style={[styles.podiumItem, user.isFirst && styles.podiumFirst]}>
                      {user.isFirst && <IconSymbol name="crown.fill" size={24} color="#FFD700" style={{position: 'absolute', top: -20, left: 20}} />}
                      <View style={styles.podiumAvatar}><IconSymbol name="paw.fill" size={24} color="#ccc" /></View>
                      <View style={[styles.rankBadge, {backgroundColor: user.color}]}><Text style={styles.rankBadgeText}>{user.rank}</Text></View>
                      <Text style={styles.podiumName}>{user.name}</Text>
                      <Text style={styles.podiumPoints}>{user.points} XP</Text>
                  </View>
              ))}
          </View>

          <Text style={styles.sectionTitle}>Thứ hạng khác</Text>
          
          <View style={styles.listContainer}>
             {others.map((u) => (
                 <View key={u.name} style={styles.listItem}>
                     <Text style={styles.listRank}>{u.rank}</Text>
                     <View style={styles.listAvatar}><IconSymbol name="paw.fill" size={16} color="#ccc" /></View>
                     <View style={styles.listInfo}>
                         <Text style={styles.listName}>{u.name}</Text>
                         <Text style={styles.listSub}>Thử thách đã thắng</Text>
                     </View>
                     <Text style={styles.listPoints}>{u.points}</Text>
                 </View>
             ))}
          </View>

      </ScrollView>

      {/* User fixed rank at bottom */}
      <View style={styles.userFixedRank}>
         <Text style={[styles.listRank, {color: '#fff'}]}>42</Text>
         <View style={styles.listAvatar}><IconSymbol name="person.fill" size={16} color="#ccc" /></View>
         <View style={styles.listInfo}>
             <Text style={[styles.listName, {color: '#fff'}]}>Thứ hạng của bạn (Max)</Text>
             <Text style={[styles.listSub, {color: '#FFEBEB'}]}>Bạn nằm trong top 15%</Text>
         </View>
         <View>
            <Text style={[styles.listPoints, {color: '#fff'}]}>840</Text>
            <Text style={[styles.listSub, {color: '#fff', fontSize: 8}]}>COINS</Text>
         </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingBottom: 0 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#FF4D4D' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  activeTabText: { color: '#FF4D4D' },

  subTabContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 20, paddingBottom: 10, paddingHorizontal: 40 },
  subTabText: { fontSize: 14, color: '#999', fontWeight: 'bold' },
  subTabActive: { color: '#FF4D4D' },

  content: { padding: 20, paddingBottom: 100 },
  podium: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160, marginBottom: 40, marginTop: 20 },
  podiumItem: { alignItems: 'center', position: 'relative' },
  podiumFirst: { transform: [{scale: 1.1}], paddingBottom: 20 },
  podiumAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F0F0F0', marginBottom: 12 },
  rankBadge: { position: 'absolute', top: 50, right: 0, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', zIndex: 2, borderWidth: 1, borderColor: '#fff' },
  rankBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  podiumName: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' },
  podiumPoints: { fontSize: 12, color: '#FF4D4D', fontWeight: 'bold', marginTop: 4 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },
  listContainer: { gap: 16 },
  listItem: { flexDirection: 'row', alignItems: 'center' },
  listRank: { width: 30, fontSize: 16, fontWeight: 'bold', color: '#999', textAlign: 'center' },
  listAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  listInfo: { flex: 1 },
  listName: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  listSub: { fontSize: 11, color: '#999' },
  listPoints: { fontSize: 14, fontWeight: 'bold', color: '#FF4D4D' },

  userFixedRank: { position: 'absolute', bottom: 0, left: 16, right: 16, backgroundColor: '#FF4D4D', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#FF4D4D', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 10 }
});
