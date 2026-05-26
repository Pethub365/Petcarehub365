import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions, 
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import petApi from '../../apis/petApi';
import { getStorageItem, setStorageItem } from '../../utils/storage';

const { width: screenWidth } = Dimensions.get('window');
const podiumColumnWidth = (screenWidth - 72) / 3; // Account for margins and gaps

export default function RanksScreen() {
  const [timeFilter, setTimeFilter] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);

  const colors = {
    background: '#FAF9F9',
    card: '#ffffff',
    text: '#1B2530',
    subtext: '#8A9AA9',
    primary: '#EC4B4B',
    primaryBg: '#FFF5F5',
    gold: '#FFC529',
    silver: '#A5B2C0',
    bronze: '#E29051',
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          // Load selected pet details first to fetch user pet rank dynamically
          let petId = await getStorageItem('selectedPetId');
          
          // If the petId is mock or not present, try to fetch real user pets
          if (!petId || petId.startsWith('mock_')) {
            try {
              const myPetsRes = await petApi.getPets() as any;
              const myPets = myPetsRes.data?.pets || myPetsRes.data || [];
              if (myPets.length > 0) {
                petId = myPets[0]._id;
                await setStorageItem('selectedPetId', myPets[0]._id);
              } else {
                petId = null;
              }
            } catch (e) {
              console.error('Error fetching real user pets for ranking:', e);
              petId = null;
            }
          }
          
          const isMockId = !petId || petId.startsWith('mock_');
          const res = await petApi.getLeaderboard(undefined, (isMockId || !petId) ? undefined : petId) as any;
          let rawData: any[] = [];
          let serverUserPetRank = null;
          let serverUserPetData = null;
          
          if (res && res.success) {
            rawData = res.data.leaderboard || res.data || [];
            setLeaderboard(rawData);
            serverUserPetRank = res.data.currentPetRank;
            serverUserPetData = res.data.currentPetData;
          }

          if (petId && !isMockId) {
            const foundIndex = rawData.findIndex(p => p._id === petId);
            if (foundIndex !== -1) {
              setSelectedPet({
                ...rawData[foundIndex],
                rank: foundIndex + 1
              });
            } else if (serverUserPetData) {
              setSelectedPet({
                ...serverUserPetData,
                rank: serverUserPetRank || 42
              });
            } else {
              try {
                const petRes = await petApi.getPetById(petId) as any;
                const petData = petRes.data?.data?.pet || petRes.data?.pet || petRes.data;
                if (petData) {
                  setSelectedPet({
                    ...petData,
                    rank: 42
                  });
                }
              } catch (err) {
                console.error('Error fetching pet details as fallback:', err);
                setSelectedPet(null);
              }
            }
          } else {
            setSelectedPet(null);
          }
        } catch (err) {
          console.error('Error loading ranking data:', err);
          setSelectedPet(null);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [])
  );

  const getFilteredLeaderboard = () => {
    const apiPets = leaderboard.map((pet) => ({
      _id: pet._id,
      name: pet.name,
      avatar_url: pet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200',
      challengesWon: pet.stats?.level ? pet.stats.level * 2 : 5,
      stats: {
        xp: pet.stats?.xp || 0,
        level: pet.stats?.level || 1,
      }
    }));

    const adjusted = apiPets.map(pet => {
      let xpVal = pet.stats.xp;
      let challenges = pet.challengesWon;
      
      if (timeFilter === 'WEEK') {
        xpVal = Math.max(100, Math.round(xpVal * 0.25));
      } else {
        xpVal = Math.max(300, xpVal);
        challenges = Math.round(challenges * 3);
      }

      return {
        ...pet,
        challengesWon: challenges,
        stats: {
          ...pet.stats,
          xp: xpVal
        }
      };
    });

    return adjusted.sort((a, b) => (b.stats?.xp || 0) - (a.stats?.xp || 0));
  };

  const filteredLeaderboard = getFilteredLeaderboard();
  const top1 = filteredLeaderboard[0] || null;
  const top2 = filteredLeaderboard[1] || null;
  const top3 = filteredLeaderboard[2] || null;
  const restPets = filteredLeaderboard.slice(3);

  const activeUserPet = selectedPet ? (() => {
    const foundIndex = filteredLeaderboard.findIndex(p => p._id === selectedPet._id);
    if (foundIndex !== -1) {
      return {
        ...selectedPet,
        rank: foundIndex + 1,
        stats: {
          ...selectedPet.stats,
          xp: filteredLeaderboard[foundIndex].stats?.xp
        }
      };
    } else {
      const finalXP = timeFilter === 'WEEK' ? 840 : 2680;
      return {
        ...selectedPet,
        rank: selectedPet.rank || 42,
        stats: {
          ...selectedPet.stats,
          xp: finalXP
        }
      };
    }
  })() : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Bảng xếp hạng
        </Text>
        <View style={styles.headerIconCircle}>
          <Ionicons name="trophy" size={18} color={colors.primary} />
        </View>
      </View>

      {/* Segment Tabs */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, timeFilter === 'WEEK' && styles.tabBtnActive]} 
            onPress={() => setTimeFilter('WEEK')}
          >
            <Text style={[styles.tabText, timeFilter === 'WEEK' && styles.tabTextActive]}>Tuần</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, timeFilter === 'MONTH' && styles.tabBtnActive]} 
            onPress={() => setTimeFilter('MONTH')}
          >
            <Text style={[styles.tabText, timeFilter === 'MONTH' && styles.tabTextActive]}>Tháng</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.ranksScrollContainer} showsVerticalScrollIndicator={false}>
            {/* Soft pink to white gradient behind podium */}
            <LinearGradient 
              colors={['#FFF5F5', '#FAF9F9']} 
              style={styles.podiumGradientBg}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            >
              {/* Top 3 Podium (Floating Avatars) */}
              <View style={styles.podiumContainer}>
                {/* 2nd place (Left) */}
                <View style={[styles.podiumColumn, { width: podiumColumnWidth }]}>
                  {top2 && (
                    <View style={styles.podiumCard}>
                      <View style={styles.podiumAvatarWrapper}>
                        <View style={[styles.podiumAvatarOuterBorder, { borderColor: colors.silver }]}>
                          <Image source={{ uri: top2.avatar_url }} style={styles.podiumAvatar} />
                        </View>
                        <View style={[styles.podiumRankBadge, { backgroundColor: colors.silver }]}>
                          <Text style={styles.podiumRankText}>#2</Text>
                        </View>
                      </View>
                      <Text style={styles.podiumPetName} numberOfLines={1}>{top2.name}</Text>
                      <Text style={styles.podiumPetXP}>{Number(top2.stats?.xp || 0).toLocaleString()} XP</Text>
                    </View>
                  )}
                </View>

                {/* 1st place (Center) */}
                <View style={[styles.podiumColumn, styles.podiumColumnCenter, { width: podiumColumnWidth + 12 }]}>
                  {top1 && (
                    <View style={styles.podiumCard}>
                      <View style={[styles.podiumAvatarWrapper, styles.podiumAvatarWrapperCenter]}>
                        <MaterialCommunityIcons name="crown" size={24} color={colors.gold} style={styles.podiumCrownCenter} />
                        <View style={[styles.podiumAvatarOuterBorder, styles.podiumAvatarOuterBorderCenter, { borderColor: colors.gold }]}>
                          <Image source={{ uri: top1.avatar_url }} style={[styles.podiumAvatar, styles.podiumAvatarCenter]} />
                        </View>
                        <View style={[styles.podiumRankBadge, styles.podiumRankBadgeCenter, { backgroundColor: colors.gold }]}>
                          <Text style={styles.podiumRankTextCenter}>#1</Text>
                        </View>
                      </View>
                      <Text style={[styles.podiumPetName, styles.podiumPetNameCenter]} numberOfLines={1}>{top1.name}</Text>
                      <Text style={[styles.podiumPetXP, styles.podiumPetXPCenter]}>{Number(top1.stats?.xp || 0).toLocaleString()} XP</Text>
                    </View>
                  )}
                </View>

                {/* 3rd place (Right) */}
                <View style={[styles.podiumColumn, { width: podiumColumnWidth }]}>
                  {top3 && (
                    <View style={styles.podiumCard}>
                      <View style={styles.podiumAvatarWrapper}>
                        <View style={[styles.podiumAvatarOuterBorder, { borderColor: colors.bronze }]}>
                          <Image source={{ uri: top3.avatar_url }} style={styles.podiumAvatar} />
                        </View>
                        <View style={[styles.podiumRankBadge, { backgroundColor: colors.bronze }]}>
                          <Text style={styles.podiumRankText}>#3</Text>
                        </View>
                      </View>
                      <Text style={styles.podiumPetName} numberOfLines={1}>{top3.name}</Text>
                      <Text style={styles.podiumPetXP}>{Number(top3.stats?.xp || 0).toLocaleString()} XP</Text>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>

            {/* Section: Thứ hạng khác */}
            <View style={styles.otherRanksContainer}>
              <Text style={styles.otherRanksTitle}>Thứ hạng khác</Text>

              {/* Rank List items */}
              <View style={styles.listContainer}>
                {restPets.map((pet, index) => {
                  const rankNum = index + 4;
                  return (
                    <View key={pet._id || index} style={styles.listItem}>
                      <Text style={styles.listRankNum}>{rankNum}</Text>
                      
                      <View style={styles.listAvatarContainer}>
                        <Image source={{ uri: pet.avatar_url }} style={styles.listAvatar} />
                      </View>

                      <View style={styles.listInfo}>
                        <Text style={styles.listPetName} numberOfLines={1}>{pet.name}</Text>
                        <Text style={styles.listPetLevel}>{pet.challengesWon} Thử thách đã thắng</Text>
                      </View>

                      <Text style={styles.listXPVal}>{Number(pet.stats?.xp || 0).toLocaleString()}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Floating Sticky bottom card showing selected pet rank */}
          {activeUserPet && (
            <View style={styles.stickyBottomCard}>
              <View style={styles.stickyItem}>
                <Text style={styles.stickyRank}>{activeUserPet.rank || 42}</Text>
                <View style={styles.stickyAvatarWrapper}>
                  <Image 
                    source={{ uri: activeUserPet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200' }} 
                    style={styles.stickyAvatar} 
                  />
                </View>
                <View style={styles.stickyInfo}>
                  <Text style={styles.stickyName}>Thứ hạng của bạn ({activeUserPet.name || 'Max'})</Text>
                  <Text style={styles.stickyLevel}>Bạn nằm trong top 15%</Text>
                </View>
                <View style={styles.stickyXPContainer}>
                  <Text style={styles.stickyXPValue}>{Number(activeUserPet.stats?.xp || 840).toLocaleString()}</Text>
                  <Text style={styles.stickyXPLabel}>ĐIỂM</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 14, 
    backgroundColor: '#fff',
    position: 'relative',
    height: 56,
  },
  headerBackBtn: { 
    position: 'absolute',
    left: 20,
    padding: 4 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1B2530',
  },
  headerIconCircle: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 60,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F5F5F7',
  },
  tabBtn: {
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    width: 80,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomColor: '#EC4B4B',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8A9AA9',
  },
  tabTextActive: {
    color: '#EC4B4B',
    fontWeight: 'bold',
  },
  ranksScrollContainer: {
    paddingBottom: 130, // Extra padding to clear the floating bottom card
  },
  podiumGradientBg: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  podiumColumn: {
    alignItems: 'center',
  },
  podiumColumnCenter: {
    bottom: 6,
  },
  podiumCard: {
    alignItems: 'center',
    width: '100%',
  },
  podiumAvatarWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  podiumAvatarWrapperCenter: {
    width: 96,
    height: 96,
  },
  podiumAvatarOuterBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 3,
    padding: 2,
    backgroundColor: '#fff',
  },
  podiumAvatarOuterBorderCenter: {
    borderRadius: 48,
    borderWidth: 4,
    shadowColor: '#FFC529',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  podiumAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  podiumAvatarCenter: {
    borderRadius: 42,
  },
  podiumCrownCenter: {
    position: 'absolute',
    top: -22,
    alignSelf: 'center',
    zIndex: 10,
  },
  podiumRankBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
    zIndex: 11,
  },
  podiumRankBadgeCenter: {
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  podiumRankText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  podiumRankTextCenter: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  podiumPetName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B2530',
    marginTop: 10,
    textAlign: 'center',
  },
  podiumPetNameCenter: {
    fontSize: 14,
  },
  podiumPetXP: {
    fontSize: 11,
    color: '#EC4B4B',
    fontWeight: 'bold',
    marginTop: 4,
  },
  podiumPetXPCenter: {
    fontSize: 12,
  },
  otherRanksContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  otherRanksTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B2530',
    marginBottom: 14,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#1B2530',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  listRankNum: {
    width: 24,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A9AA9',
  },
  listAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  listAvatar: {
    width: '100%',
    height: '100%',
  },
  listInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  listPetName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B2530',
    marginBottom: 2,
  },
  listPetLevel: {
    fontSize: 11,
    color: '#8A9AA9',
    fontWeight: '500',
  },
  listXPVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4D4D',
  },
  stickyBottomCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FF4D4D',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#FF4D4D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  stickyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyRank: {
    width: 24,
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stickyAvatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  stickyAvatar: {
    width: '100%',
    height: '100%',
  },
  stickyInfo: {
    flex: 1,
  },
  stickyName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stickyLevel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  stickyXPContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyXPValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stickyXPLabel: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
