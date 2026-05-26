import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import petApi from '../../apis/petApi';
import dailyQuestApi from '../../apis/dailyQuestApi';
import authApi from '../../apis/authApi';
import { getStorageItem, setStorageItem } from '../../utils/storage';

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';
  
  const bgColors = {
      main: '#FAF9F9',
      card: '#fff',
      text: '#1B2530',
      subtext: '#8A9AA9',
      border: '#FFEBEB',
      redBg: '#FFF5F5',
      redBorder: '#FFEBEB',
      iconBg: '#F8F8F8'
  };

  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'single' | 'multi'>('multi');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Hàm load danh sách thú cưng và nhiệm vụ tương ứng
  const loadData = async () => {
    try {
      setLoading(true);
      // Load user info alongside pets
      const [petRes, userRes] = await Promise.all([
        petApi.getPets() as any,
        authApi.getMe() as any,
      ]);

      if (userRes && userRes.success) {
        setCurrentUser(userRes.data.user);
      }

      if (petRes && petRes.success) {
        const petList = petRes.data.pets || [];
        
        if (petList.length > 0) {
          setPets(petList);
          // Xem trước đó đã chọn thú cưng nào chưa
          const savedPetId = await getStorageItem('selectedPetId');
          let currentPet = petList.find((p: any) => p._id === savedPetId);
          if (!currentPet) {
            currentPet = petList[0];
          }
          setSelectedPet(currentPet);
          await setStorageItem('selectedPetId', currentPet._id);
          await loadQuests(currentPet._id);
          
          // Auto choose single pet mode if only 1 pet
          if (petList.length === 1) {
            setLayoutMode('single');
          } else {
            setLayoutMode('multi');
          }
        } else {
          // Mock data to showcase the design when no pets are in the DB
          const mockPets = [
            {
              _id: 'mock_mochi',
              name: 'Mochi',
              breed: 'Chó Corgi',
              species: 'DOG',
              avatar_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=200',
              stats: { level: 12, xp: 1300 }
            },
            {
              _id: 'mock_luna',
              name: 'Luna',
              breed: 'Mèo Mỹ',
              species: 'CAT',
              avatar_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200',
              stats: { level: 8, xp: 600 }
            }
          ];
          setPets(mockPets);
          setSelectedPet(mockPets[0]);
          setLayoutMode('multi');
          // Load mock quests
          setQuests([
            {
              _id: 'mock_q1',
              title: 'Bữa sáng',
              description: '08:00 AM • Hạt & Nước',
              category: 'NUTRITION',
              status: 'COMPLETED',
              reward_xp: 30
            },
            {
              _id: 'mock_q2',
              title: 'Đi dạo buổi sáng',
              description: '09:30 AM • Mục tiêu 30 phút',
              category: 'DAILY_ROUTINE',
              status: 'IN_PROGRESS',
              reward_xp: 50
            },
            {
              _id: 'mock_q3',
              title: 'Chải lông',
              description: '06:00 PM • Chăm sóc lông',
              category: 'TRAINING',
              status: 'PENDING',
              reward_xp: 20
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load nhiệm vụ theo petId
  const loadQuests = async (petId: string) => {
    if (petId.startsWith('mock_')) return;
    try {
      const qRes = await dailyQuestApi.getDailyQuests(petId) as any;
      if (qRes && qRes.success) {
        setQuests(qRes.data.quests || []);
      }
    } catch (error) {
      console.error('Error loading quests:', error);
    }
  };

  // Hook chạy mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Chọn thú cưng khác
  const handleSelectPet = async (pet: any) => {
    setSelectedPet(pet);
    await setStorageItem('selectedPetId', pet._id);
    if (pet._id.startsWith('mock_')) {
      // Mock quests for Mochi / Luna
      if (pet._id === 'mock_mochi') {
        setQuests([
          {
            _id: 'mock_q1',
            title: 'Bữa sáng',
            description: '08:00 AM • Hạt & Nước',
            category: 'NUTRITION',
            status: 'COMPLETED',
            reward_xp: 30
          },
          {
            _id: 'mock_q2',
            title: 'Đi dạo buổi sáng',
            description: '09:30 AM • Mục tiêu 30 phút',
            category: 'DAILY_ROUTINE',
            status: 'IN_PROGRESS',
            reward_xp: 50
          },
          {
            _id: 'mock_q3',
            title: 'Chải lông',
            description: '06:00 PM • Chăm sóc lông',
            category: 'TRAINING',
            status: 'PENDING',
            reward_xp: 20
          }
        ]);
      } else {
        setQuests([
          {
            _id: 'mock_q4',
            title: 'Bữa tối',
            description: '07:00 PM • Pate dinh dưỡng',
            category: 'NUTRITION',
            status: 'PENDING',
            reward_xp: 40
          }
        ]);
      }
    } else {
      setLoading(true);
      await loadQuests(pet._id);
      setLoading(false);
    }
  };

  const toggleLayoutMode = () => {
    setLayoutMode(prev => prev === 'single' ? 'multi' : 'single');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColors.main }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, layoutMode === 'multi' && styles.headerMulti]}>
        {layoutMode === 'single' ? (
          <>
            <View style={styles.headerLeftRow}>
              <View style={styles.pawLogoContainer}>
                <Ionicons name="paw" size={16} color="#EC4B4B" />
              </View>
              <TouchableOpacity onPress={toggleLayoutMode} activeOpacity={0.8}>
                <Text style={styles.headerTitle}>PetCare Hub</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.bellIconCircleSingle} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications" size={20} color="#1B2530" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.menuIconCircle} onPress={() => Alert.alert('Menu', 'Tính năng Menu mở rộng đang được phát triển.')}>
              <Ionicons name="menu-sharp" size={20} color="#1B2530" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={toggleLayoutMode} activeOpacity={0.8}>
              <Text style={styles.headerTitleCenter}>PetCare Hub</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.bellIconCircle} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications" size={20} color="#1B2530" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {loading && pets.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4B4B" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {layoutMode === 'multi' ? (
            /* ========================================================
               MULTI-PET LAYOUT (giao diện multipet)
               ======================================================== */
            <View>
              <Text style={[styles.sectionTitle, { color: bgColors.text }]}>Thú cưng của bạn</Text>
              
              <View style={styles.petScroll}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {pets.map((pet, idx) => {
                     const isSelected = selectedPet && selectedPet._id === pet._id;
                     const showCompleted = pet._id?.startsWith('mock_') 
                       ? pet._id === 'mock_mochi' 
                       : !!pet.isTodayQuestsCompleted;
                     return (
                       <TouchableOpacity 
                          key={pet._id} 
                          style={styles.petAvatarWrapper}
                          onPress={() => handleSelectPet(pet)}
                       >
                           <View style={[styles.petAvatarRing, isSelected && styles.petAvatarRingActive]}>
                               <View style={styles.petIconPlaceholder}>
                                   {pet.avatar_url ? (
                                       <Image source={{ uri: pet.avatar_url }} style={styles.petImage} />
                                   ) : (
                                       <Ionicons name="paw" size={28} color={isSelected ? '#EC4B4B' : '#8A9AA9'} />
                                   )}
                               </View>
                               {/* Green check or exclamation alert badge */}
                               {showCompleted ? (
                                 <View style={[styles.petBadge, { backgroundColor: '#27AE60' }]}>
                                   <Ionicons name="checkmark" size={10} color="#fff" />
                                 </View>
                               ) : (
                                 <View style={[styles.petBadge, { backgroundColor: '#EB5757' }]}>
                                   <Text style={styles.petBadgeTextAlert}>!</Text>
                                 </View>
                               )}
                           </View>
                           <Text style={[
                             styles.petName, 
                             isSelected && styles.petNameSelected, 
                             { color: isSelected ? '#EC4B4B' : bgColors.text }
                           ]} numberOfLines={1}>
                             {pet.name}
                           </Text>
                       </TouchableOpacity>
                     );
                  })}
                  <TouchableOpacity style={styles.petAvatarWrapper} onPress={() => router.push('/(setup)/pet-setup-1')}>
                      <View style={styles.petAvatarRingDashed}>
                           <Ionicons name="add" size={24} color="#8A9AA9" />
                      </View>
                      <Text style={[styles.petName, { color: bgColors.subtext }]}>Thêm thú cưng</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Plant Status Container */}
              {selectedPet && (
                <View style={styles.activePetStatusBanner}>
                  <View style={styles.statusSproutCircle}>
                    <FontAwesome5 name="seedling" size={18} color="#fff" />
                  </View>
                  <View style={styles.statusBannerTextContainer}>
                    <Text style={styles.statusBannerTextBold}>{selectedPet.name} đang làm rất tốt!</Text>
                    <Text style={styles.statusBannerTextNormal}>Đã hoàn thành các thói quen buổi sáng. Bữa ăn tiếp theo sau 2 giờ nữa.</Text>
                  </View>
                </View>
              )}

              {/* Tasks List Section */}
              {selectedPet && (
                <View style={styles.tasksSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.tasksTitle}>Nhiệm vụ hàng ngày của {selectedPet.name}</Text>
                    <TouchableOpacity onPress={() => router.push('/mission-detail')}>
                      <Text style={styles.viewAllText}>Xem tất cả</Text>
                    </TouchableOpacity>
                  </View>

                  {quests.length === 0 ? (
                    <Text style={styles.emptyText}>Không có nhiệm vụ nào cho hôm nay.</Text>
                  ) : (
                    quests.map((quest) => {
                      const isDone = quest.status === 'COMPLETED';
                      const isWorking = quest.status === 'IN_PROGRESS';
                      
                      let progressPercent = 0;
                      let statusText = 'TRẠNG THÁI: SẮP TỚI';
                      let iconName = 'restaurant';
                      let iconColor = '#FFA500';
                      let iconBg = '#FFF3E0';

                      if (isDone) {
                        progressPercent = 100;
                        statusText = 'TRẠNG THÁI: HOÀN THÀNH';
                      } else if (isWorking) {
                        progressPercent = 65;
                        statusText = 'TRẠNG THÁI: ĐANG THỰC HIỆN';
                      }

                      if (quest.category === 'DAILY_ROUTINE' || quest.title.includes('dạo')) {
                        iconName = 'walk';
                        iconColor = '#2F80ED';
                        iconBg = '#E2F0FF';
                      } else if (quest.category === 'TRAINING' || quest.title.includes('lông') || quest.title.includes('Chải')) {
                        iconName = 'cut';
                        iconColor = '#9B51E0';
                        iconBg = '#F3E5F5';
                      }

                      return (
                        <TouchableOpacity 
                          key={quest._id} 
                          style={styles.taskCard}
                          onPress={() => router.push({
                            pathname: '/mission-detail',
                            params: { questId: quest._id }
                          } as any)}
                        >
                          <View style={styles.taskTopRow}>
                            <View style={[styles.taskIconCircle, { backgroundColor: iconBg }]}>
                              <Ionicons name={iconName as any} size={18} color={iconColor} />
                            </View>
                            <View style={styles.taskMeta}>
                              <Text style={styles.taskTitleText}>{quest.title}</Text>
                              <Text style={styles.taskDescText}>{quest.description}</Text>
                              
                              <View style={styles.rewardsRow}>
                                <View style={styles.rewardXpBadge}>
                                  <FontAwesome5 name="star" size={9} color="#27AE60" style={{ marginRight: 4 }} />
                                  <Text style={styles.rewardXpText}>+{quest.reward_xp || 0} XP</Text>
                                </View>
                                <View style={styles.rewardCoinBadge}>
                                  <FontAwesome5 name="coins" size={9} color="#FFB000" style={{ marginRight: 4 }} />
                                  <Text style={styles.rewardCoinText}>+{quest.reward_coin || 10} Coin</Text>
                                </View>
                              </View>
                            </View>
                            
                            {/* Done checkmark or solid grey circle */}
                            {isDone ? (
                              <View style={[styles.taskCheckWrapper, styles.taskCheckWrapperActive]}>
                                <Ionicons name="checkmark" size={14} color="#fff" />
                              </View>
                            ) : (
                              <View style={styles.taskCheckWrapperUnchecked} />
                            )}
                          </View>

                          {/* Progress Line */}
                          <View style={styles.taskProgressBg}>
                            <View style={[styles.taskProgressFill, { width: `${progressPercent}%` }]} />
                          </View>

                          <View style={styles.taskBottomRow}>
                            <Text style={styles.taskStatusText}>
                              {statusText}
                            </Text>
                            <Text style={styles.taskProgressPercent}>{progressPercent}%</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          ) : (
            /* ========================================================
               SINGLE-PET LAYOUT (gd 1pet)
               ======================================================== */
            <View>
              {/* Pet Banner Card */}
              <View style={styles.petCardSingle}>
                <Image 
                  source={{ uri: selectedPet?.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300' }} 
                  style={styles.petCardSingleImage} 
                  resizeMode="cover"
                />
                <View style={styles.petCardSingleInfoRow}>
                  <View style={styles.petCardSingleInfoLeft}>
                    <Text style={styles.petCardSingleLabel}>Pet Name</Text>
                    <Text style={styles.petCardSingleName}>{selectedPet?.name || 'Rudy'}</Text>
                    <View style={styles.petCardSingleMoodRow}>
                      <Text style={styles.petCardSingleMoodText}>😊 Mood: Happy</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.petCardSingleStartBtn}
                    onPress={() => router.push('/mission-detail')}
                  >
                    <Text style={styles.petCardSingleStartBtnText}>Start</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* My Profile Section */}
              <View style={styles.profileSection}>
                <View style={styles.profileMeta}>
                  <Text style={styles.profileSectionLabel}>My Profile</Text>
                  <Text style={styles.profileUserName}>
                    {currentUser?.profile?.full_name || currentUser?.email?.split('@')[0] || 'User1'}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.profileLevelCapsule}>
                      <Text style={styles.profileLevelText}>LEVEL {selectedPet?.stats?.level || 12}</Text>
                    </View>
                    <View style={styles.profileStreakCapsule}>
                      <Text style={styles.profileStreakText}>🔥 7-day streak</Text>
                    </View>
                  </View>
                </View>
                {currentUser?.profile?.avatar_url ? (
                  <Image 
                    source={{ uri: currentUser.profile.avatar_url }}
                    style={styles.userAvatarImage}
                  />
                ) : (
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200' }}
                    style={styles.userAvatarImage}
                  />
                )}
              </View>

              {/* Progress Level Card */}
              <View style={styles.levelProgressCard}>
                <View style={styles.levelCardTop}>
                  <View style={styles.levelCardTopLeft}>
                    <Ionicons name="ribbon" size={18} color="#EC4B4B" />
                    <Text style={styles.levelProgressTitle}>Tiến trình hiện tại</Text>
                  </View>
                  <Text style={styles.levelProgressDiff}>
                    {selectedPet?.stats?.xp || 1300}/{((selectedPet?.stats?.level || 12) * 100 + 800) || 2000} XP
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={styles.levelProgressBg}>
                  <View style={[
                    styles.levelProgressFill, 
                    { 
                      width: `${Math.min(100, Math.round(((selectedPet?.stats?.xp || 1300) / ((selectedPet?.stats?.level || 12) * 100 + 800)) * 100))}%` 
                    }
                  ]} />
                </View>

                <Text style={styles.levelProgressSub}>
                  {Math.min(100, Math.round(((selectedPet?.stats?.xp || 1300) / ((selectedPet?.stats?.level || 12) * 100 + 800)) * 100))}% to Level {(selectedPet?.stats?.level || 12) + 1}! Giữ vững phong độ !
                </Text>
              </View>

              {/* 3 Quick Action Cards */}
              <View style={styles.quickActionsRow}>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/mission-detail')}
                >
                  <View style={[styles.quickActionIconWrap, { backgroundColor: '#E1F0FF' }]}>
                    <Ionicons name="checkbox" size={20} color="#2D9CDB" />
                  </View>
                  <Text style={styles.quickActionTitle}>Nhiệm vụ</Text>
                  <Text style={styles.quickActionVal}>4/5 Done</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/health-dashboard')}
                >
                  <View style={[styles.quickActionIconWrap, { backgroundColor: '#E2FBE9' }]}>
                    <Ionicons name="add-circle" size={20} color="#27AE60" />
                  </View>
                  <Text style={styles.quickActionTitle}>Sức khỏe</Text>
                  <Text style={styles.quickActionVal}>Excellent</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/health-dashboard')}
                >
                  <View style={[styles.quickActionIconWrap, { backgroundColor: '#F9EFFF' }]}>
                    <Ionicons name="shield-checkmark" size={20} color="#C462FF" />
                  </View>
                  <Text style={styles.quickActionTitle}>Vaccine</Text>
                  <Text style={styles.quickActionVal}>Up to date</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    backgroundColor: '#fff',
  },
  headerMulti: {
    justifyContent: 'space-between',
  },
  headerLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pawLogoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EC4B4B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B2530' },
  headerTitleCenter: { fontSize: 18, fontWeight: 'bold', color: '#1B2530', textAlign: 'center' },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIconCircleSingle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1B2530',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20, paddingBottom: 60 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 400 },
  emptyText: { textAlign: 'center', color: '#8A9AA9', marginVertical: 20, fontWeight: '500' },
  
  /* ========================================================
     MULTI-PET STYLE
     ======================================================== */
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 16, color: '#1B2530' },
  petScroll: { flexDirection: 'row', marginBottom: 20 },
  petAvatarWrapper: { alignItems: 'center', marginRight: 16, width: 75 },
  petAvatarRing: { 
    width: 66, 
    height: 66, 
    borderRadius: 33, 
    borderWidth: 2, 
    borderColor: '#E0E5EC',
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative'
  },
  petAvatarRingActive: { borderColor: '#EC4B4B' },
  petAvatarRingDashed: { 
    width: 66, 
    height: 66, 
    borderRadius: 33, 
    borderWidth: 2, 
    borderColor: '#8A9AA9', 
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  petIconPlaceholder: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFF5F5', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  petImage: { width: 58, height: 58, borderRadius: 29 },
  petBadge: { 
    position: 'absolute', 
    bottom: -1, 
    right: -1, 
    width: 18, 
    height: 18, 
    borderRadius: 9, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FAF9F9'
  },
  petBadgeTextAlert: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  petName: { fontSize: 12, marginTop: 6, fontWeight: '500', width: '100%', textAlign: 'center', color: '#1B2530' },
  petNameSelected: { fontWeight: 'bold', color: '#EC4B4B' },
  
  activePetStatusBanner: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF0F0', 
    borderRadius: 20, 
    padding: 14, 
    borderWidth: 1, 
    borderColor: '#FFEBEB',
    marginBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  statusSproutCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: '#EC4B4B', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  statusBannerTextContainer: {
    flex: 1,
  },
  statusBannerTextBold: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B2530',
    marginBottom: 2,
  },
  statusBannerTextNormal: {
    fontSize: 12,
    color: '#8A9AA9',
    lineHeight: 18,
    fontWeight: '500',
  },
  
  tasksSection: { marginTop: 4 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tasksTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B2530' },
  viewAllText: { fontSize: 13, fontWeight: 'bold', color: '#EC4B4B' },
  
  taskCard: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#FFEBEB' },
  taskTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  taskIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  taskMeta: { flex: 1 },
  taskTitleText: { fontSize: 14, fontWeight: 'bold', color: '#1B2530', marginBottom: 3 },
  taskDescText: { fontSize: 12, color: '#8A9AA9', fontWeight: '500' },
  
  taskCheckWrapper: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  taskCheckWrapperActive: { 
    backgroundColor: '#EB5757', 
  },
  taskCheckWrapperUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D0D4DC', 
  },
  
  taskProgressBg: { height: 6, backgroundColor: '#FFF0F0', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  taskProgressFill: { height: '100%', backgroundColor: '#EC4B4B', borderRadius: 3 },
  
  taskBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskStatusText: { fontSize: 10, fontWeight: 'bold', color: '#8A9AA9' },
  taskProgressPercent: { fontSize: 10, fontWeight: 'bold', color: '#8A9AA9' },

  /* ========================================================
     SINGLE PET STYLE
     ======================================================== */
  petCardSingle: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFEBEB',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#EC4B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  petCardSingleImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
  },
  petCardSingleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  petCardSingleInfoLeft: {
    flex: 1,
  },
  petCardSingleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#EC4B4B',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  petCardSingleName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B2530',
    marginBottom: 4,
  },
  petCardSingleMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petCardSingleMoodText: {
    fontSize: 12,
    color: '#1B2530',
    fontWeight: '500',
  },
  petCardSingleStartBtn: {
    backgroundColor: '#EC4B4B',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petCardSingleStartBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  profileSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#FFEBEB', 
    marginBottom: 16 
  },
  profileMeta: { flex: 1 },
  profileSectionLabel: { 
    fontSize: 10, 
    color: '#EC4B4B', 
    fontWeight: 'bold', 
    textTransform: 'uppercase',
    marginBottom: 2 
  },
  profileUserName: { fontSize: 18, fontWeight: 'bold', color: '#1B2530', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileLevelCapsule: { backgroundColor: '#F0F2F4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  profileLevelText: { fontSize: 9, fontWeight: 'bold', color: '#8A9AA9' },
  profileStreakCapsule: { backgroundColor: '#FFF0F0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  profileStreakText: { fontSize: 9, fontWeight: 'bold', color: '#EC4B4B' },
  userAvatarImage: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: '#FFEBEB' },
  
  levelProgressCard: { backgroundColor: '#fff', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#FFEBEB', marginBottom: 16 },
  levelCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  levelCardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelProgressTitle: { fontSize: 14, fontWeight: 'bold', color: '#1B2530' },
  levelProgressDiff: { fontSize: 13, fontWeight: 'bold', color: '#1B2530' },
  levelProgressBg: { height: 10, backgroundColor: '#FFF0F0', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  levelProgressFill: { height: '100%', backgroundColor: '#EC4B4B', borderRadius: 5 },
  levelProgressSub: { fontSize: 11, color: '#8A9AA9', fontWeight: 'bold' },
  
  quickActionsRow: { flexDirection: 'row', gap: 12 },
  quickActionCard: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#FFEBEB', alignItems: 'center' },
  quickActionIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickActionTitle: { fontSize: 12, color: '#8A9AA9', fontWeight: 'bold', marginBottom: 4 },
  quickActionVal: { fontSize: 13, fontWeight: 'bold', color: '#1B2530' },
  
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  rewardXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rewardXpText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  rewardCoinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rewardCoinText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFB000',
  }
});
