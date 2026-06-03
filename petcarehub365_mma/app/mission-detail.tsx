import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, useColorScheme, Image, Modal, Easing, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dailyQuestApi from '../apis/dailyQuestApi';
import petApi from '../apis/petApi';
import { getStorageItem } from '../utils/storage';

// --- CELEBRATION CONFETTI & FIREWORKS COMPONENTS ---
const ConfettiParticle = ({ index }: { index: number }) => {
  const animY = React.useRef(new Animated.Value(-50)).current;
  const animX = React.useRef(new Animated.Value(0)).current;
  const animRotate = React.useRef(new Animated.Value(0)).current;

  const size = React.useMemo(() => Math.floor(Math.random() * 10) + 6, []);
  const color = React.useMemo(() => {
    const colors = ['#FFC107', '#FF5722', '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4', '#4CAF50', '#8BC34A'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);
  const startX = React.useMemo(() => Math.random() * 360, []);
  const driftX = React.useMemo(() => (Math.random() - 0.5) * 150, []);
  const duration = React.useMemo(() => Math.floor(Math.random() * 1500) + 2500, []);
  const delay = React.useMemo(() => Math.random() * 1000, []);
  const isCircle = React.useMemo(() => Math.random() > 0.5, []);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animY, {
            toValue: 600,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(animX, {
            toValue: driftX,
            duration: duration,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(animRotate, {
            toValue: 1,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(animY, { toValue: -50, duration: 0, useNativeDriver: true }),
          Animated.timing(animX, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(animRotate, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ])
    ).start();
  }, []);

  const rotateStr = animRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: 0,
        width: size,
        height: size,
        borderRadius: isCircle ? size / 2 : 2,
        backgroundColor: color,
        transform: [
          { translateY: animY },
          { translateX: animX },
          { rotate: rotateStr },
        ],
        opacity: 0.85,
        zIndex: 99,
      }}
    />
  );
};

const FireworkBurst = ({ delay, top, left }: { delay: number; top: number; left: number }) => {
  const animProgress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animProgress, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rays = Array.from({ length: 12 }).map((_, idx) => {
    const angle = (idx * 30 * Math.PI) / 180;
    const distance = 80;
    
    const transX = animProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Math.cos(angle) * distance],
    });
    
    const transY = animProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Math.sin(angle) * distance],
    });

    const opacity = animProgress.interpolate({
      inputRange: [0, 0.1, 0.8, 1],
      outputRange: [0, 1, 0.8, 0],
    });

    const colors = ['#FF2A6D', '#05D9E8', '#00F5FF', '#F5A962', '#FFE000', '#A555EC', '#4E9F3D'];
    const color = colors[idx % colors.length];

    return (
      <Animated.View
        key={idx}
        style={{
          position: 'absolute',
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          transform: [
            { translateX: transX },
            { translateY: transY },
          ],
          opacity: opacity,
        }}
      />
    );
  });

  return (
    <View style={{ position: 'absolute', top: top, left: left, width: 10, height: 10, justifyContent: 'center', alignItems: 'center', zIndex: 98 }}>
      {rays}
    </View>
  );
};

const CelebrationEffect = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {Array.from({ length: 35 }).map((_, idx) => (
        <ConfettiParticle key={`confetti-${idx}`} index={idx} />
      ))}
      <FireworkBurst delay={100} top={120} left={80} />
      <FireworkBurst delay={600} top={180} left={280} />
      <FireworkBurst delay={1100} top={320} left={150} />
    </View>
  );
};

export default function MissionDetailScreen() {
  const isDark = useColorScheme() === 'dark';
  const { questId } = useLocalSearchParams();
  
  // Mode Selection
  const isDetailMode = !!questId;

  // Detail Mode States
  const [quest, setQuest] = useState<any | null>(null);
  const [completing, setCompleting] = useState(false);

  // Success Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successRewards, setSuccessRewards] = useState<{
    xp: number;
    coins: number;
    leveledUp: boolean;
    currentLevel?: number;
    unlockedAchievements?: string[];
  } | null>(null);

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.back();
  };

  // List Mode States
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [questsList, setQuestsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('daily');
  const [loading, setLoading] = useState(true);

  // Custom Alert Modal state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const alertScale = React.useRef(new Animated.Value(0.9)).current;

  const showAlert = (title: string, msg: string) => {
    setAlertTitle(title);
    setAlertMessage(msg);
    setAlertVisible(true);
    alertScale.setValue(0.9);
    Animated.spring(alertScale, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  // Real-time countdown timer state
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdownText = (unlocksAtISO: string) => {
    if (!unlocksAtISO) return 'Bị khóa';
    const target = new Date(unlocksAtISO).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return 'Sẵn sàng';
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const bgColors = {
      main: '#FAF9F9',
      card: '#fff',
      text: '#1B2530',
      subtext: '#8A9AA9',
      border: '#FFEBEB',
      redBg: '#FFF5F5',
      redBorder: '#FFEBEB',
      accentRed: '#EC4B4B',
      accentGreen: '#27AE60',
      accentOrange: '#FF9800'
  };

  useFocusEffect(
    useCallback(() => {
      if (isDetailMode) {
        loadQuestDetail();
      } else {
        loadMissionsList();
      }
    }, [questId, isDetailMode])
  );

  React.useEffect(() => {
    if (!isDetailMode) {
      loadMissionsList();
    }
  }, [activeTab]);

  const loadQuestDetail = async () => {
    const idStr = String(questId);
    if (idStr.startsWith('mock_')) {
      const allMockQuests = [
        {
          _id: 'mock_q1',
          title: 'Đi dạo buổi sáng',
          description: '09:30 AM • Mục tiêu 30 phút',
          category: 'DAILY_ROUTINE',
          status: 'COMPLETED',
          reward_xp: 50
        },
        {
          _id: 'mock_q2',
          title: 'Cho thú cưng ăn 3 buổi',
          description: 'Chưa hoàn thành • 1/3',
          category: 'NUTRITION',
          status: 'PENDING',
          reward_xp: 30
        },
        {
          _id: 'mock_q3',
          title: 'Chơi với Pet 20 phút',
          description: 'Chưa hoàn thành • 0/20p',
          category: 'TRAINING',
          status: 'PENDING',
          reward_xp: 20
        },
        {
          _id: 'mock_training_potty',
          title: 'Dạy đi vệ sinh đúng chỗ',
          description: 'Huấn luyện đi vệ sinh đúng nơi quy định',
          category: 'TRAINING',
          status: 'PENDING',
          reward_xp: 50
        },
        {
          _id: 'mock_w1',
          title: 'Tắm cho thú cưng',
          description: 'Chưa hoàn thành • 0/1',
          category: 'DAILY_ROUTINE',
          status: 'PENDING',
          reward_xp: 150
        },
        {
          _id: 'mock_w2',
          title: 'Cắt móng & Vệ sinh tai',
          description: 'Hoàn thành • 1/1',
          category: 'HEALTH_CARE',
          status: 'COMPLETED',
          reward_xp: 100
        },
        {
          _id: 'mock_m1',
          title: 'Tẩy giun định kỳ',
          description: 'Chưa hoàn thành • 0/1',
          category: 'HEALTH_CARE',
          status: 'PENDING',
          reward_xp: 300
        },
        {
          _id: 'mock_m2',
          title: 'Cân đo & Cập nhật thể trạng',
          description: 'Hoàn thành • 1/1',
          category: 'HEALTH_CARE',
          status: 'COMPLETED',
          reward_xp: 150
        },
        {
          _id: 'mock_a1',
          title: 'Tiêm phòng dại định kỳ',
          description: 'Chưa hoàn thành • Hạn còn 2 tháng',
          category: 'HEALTH_CARE',
          status: 'PENDING',
          reward_xp: 1000
        },
        {
          _id: 'mock_a2',
          title: 'Khám sức khỏe tổng quát',
          description: 'Chưa hoàn thành • Hạn còn 6 tháng',
          category: 'HEALTH_CARE',
          status: 'PENDING',
          reward_xp: 800
        }
      ];
      const found = allMockQuests.find(q => q._id === idStr) || allMockQuests[3];
      setQuest(found);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let res = await dailyQuestApi.getQuestById(idStr).catch(() => null) as any;
      if (res && res.success && res.data.quest) {
        setQuest(res.data.quest);
      } else {
        res = await dailyQuestApi.getWeeklyQuestById(idStr).catch(() => null) as any;
        if (res && res.success && res.data.quest) {
          setQuest(res.data.quest);
        } else {
          Alert.alert('Lỗi', 'Không thể tải thông tin nhiệm vụ.');
        }
      }
    } catch (error) {
      console.error('Error loading quest detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin nhiệm vụ.');
    } finally {
      setLoading(false);
    }
  };

  const loadMissionsList = async () => {
    try {
      setLoading(true);
      const petId = await getStorageItem('selectedPetId');
      const petRes = await petApi.getPets() as any;
      
      if (petRes && petRes.success) {
        const petList = petRes.data.pets || [];
        let activePet = petList.find((p: any) => p._id === petId);
        if (!activePet && petList.length > 0) {
          activePet = petList[0];
        }
        
        if (activePet) {
          setSelectedPet(activePet);
          let qRes;
          if (activeTab === 'daily') {
            qRes = await dailyQuestApi.getDailyQuests(activePet._id) as any;
          } else {
            const periodMap = {
              weekly: 'WEEKLY',
              monthly: 'MONTHLY',
              annual: 'ANNUAL'
            } as const;
            const apiPeriod = periodMap[activeTab];
            qRes = await dailyQuestApi.getWeeklyQuests(activePet._id, apiPeriod) as any;
          }
          if (qRes && qRes.success) {
            setQuestsList(qRes.data.quests || []);
          }
        } else {
          setMockData();
        }
      } else {
        setMockData();
      }
    } catch (error) {
      console.error('Error loading missions list:', error);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setSelectedPet({
      _id: 'mock_mochi',
      name: 'Mochi',
      breed: 'Chó Corgi',
      avatar_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=200',
      stats: { level: 12, xp: 1200 }
    });
    
    if (activeTab === 'daily') {
      setQuestsList([
        {
          _id: 'mock_q1',
          title: 'Đi dạo buổi sáng',
          description: 'Hoàn thành • 30 mins',
          category: 'DAILY_ROUTINE',
          status: 'COMPLETED',
          reward_xp: 50
        },
        {
          _id: 'mock_q2',
          title: 'Cho thú cưng ăn 3 buổi',
          description: 'Chưa hoàn thành • 1/3',
          category: 'NUTRITION',
          status: 'PENDING',
          reward_xp: 30
        },
        {
          _id: 'mock_q3',
          title: 'Chơi với Pet 20 phút',
          description: 'Chưa hoàn thành • 0/20p',
          category: 'TRAINING',
          status: 'PENDING',
          reward_xp: 20
        }
      ]);
    } else if (activeTab === 'weekly') {
      setQuestsList([
        {
          _id: 'mock_w1',
          title: 'Tắm cho thú cưng',
          description: 'Chưa hoàn thành • 0/1',
          category: 'DAILY_ROUTINE',
          status: 'PENDING',
          reward_xp: 150
        },
        {
          _id: 'mock_w2',
          title: 'Cắt móng & Vệ sinh tai',
          description: 'Hoàn thành • 1/1',
          category: 'HEALTH_CARE',
          status: 'COMPLETED',
          reward_xp: 100
        }
      ]);
    } else if (activeTab === 'monthly') {
      setQuestsList([
        {
          _id: 'mock_m1',
          title: 'Tẩy giun định kỳ',
          description: 'Chưa hoàn thành • 0/1',
          category: 'HEALTH_CARE',
          status: 'PENDING',
          reward_xp: 300
        },
        {
          _id: 'mock_m2',
          title: 'Cân đo & Cập nhật thể trạng',
          description: 'Hoàn thành • 1/1',
          category: 'HEALTH_CARE',
          status: 'COMPLETED',
          reward_xp: 150
        }
      ]);
    } else if (activeTab === 'annual') {
      setQuestsList([
        {
          _id: 'mock_a1',
          title: 'Tiêm phòng dại định kỳ',
          description: 'Chưa hoàn thành • Hạn còn 2 tháng',
          category: 'HEALTH_CARE',
          status: 'PENDING',
          reward_xp: 1000
        },
        {
          _id: 'mock_a2',
          title: 'Khám sức khỏe tổng quát',
          description: 'Chưa hoàn thành • Hạn còn 6 tháng',
          category: 'HEALTH_CARE',
          status: 'PENDING',
          reward_xp: 800
        }
      ]);
    }
  };

  const handleComplete = async () => {
    if (!quest) return;
    
    if (quest._id.startsWith('mock_')) {
      try {
        setCompleting(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setSuccessRewards({
          xp: quest.reward_xp || 30,
          coins: 10,
          leveledUp: false
        });
        setShowSuccessModal(true);
      } catch (error) {
        Alert.alert('Lỗi', 'Có lỗi xảy ra');
      } finally {
        setCompleting(false);
      }
      return;
    }

    try {
      setCompleting(true);
      let res;
      if (quest.period && quest.period !== 'DAILY') {
        res = await dailyQuestApi.completeWeeklyQuest(quest._id) as any;
      } else {
        res = await dailyQuestApi.completeQuest(quest._id) as any;
      }
      if (res && res.success) {
        const { rewards } = res.data;
        const unlockedAchievements = res.data.unlockedAchievements || [];
        setSuccessRewards({
          xp: rewards.xp,
          coins: rewards.coins,
          leveledUp: rewards.leveledUp,
          currentLevel: rewards.currentLevel,
          unlockedAchievements
        });
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      showAlert('Lỗi ⚠️', error.response?.data?.message || 'Có lỗi xảy ra khi hoàn thành nhiệm vụ');
    } finally {
      setCompleting(false);
    }
  };

  const getCategorySteps = (category: string, knowledge: any) => {
    if (knowledge && knowledge.recommended_action) {
      return [
        {
          title: 'Chuẩn bị',
          desc: 'Chuẩn bị các công cụ và vệ sinh tay sạch sẽ.'
        },
        {
          title: 'Thực hiện hành động',
          desc: knowledge.recommended_action
        },
        {
          title: 'Khen thưởng & Ghi nhận',
          desc: 'Âu yếm thú cưng và tặng bánh thưởng nhỏ để tăng kết nối và ghi nhớ.'
        }
      ];
    }

    switch (category) {
      case 'HEALTH_CARE':
        return [
          {
            title: 'Kiểm tra tình trạng',
            desc: 'Xem kỹ biểu hiện lâm sàng hoặc chỉ số sức khỏe của bé để có biện pháp phù hợp.'
          },
          {
            title: 'Chăm sóc y khoa nhẹ nhàng',
            desc: 'Thực hiện thao tác mát-xa khớp, bù nước điện giải, hạ nhiệt hoặc tập thể dục nhẹ nhàng tùy theo chỉ số.'
          },
          {
            title: 'Theo dõi & Cập nhật',
            desc: 'Tiếp tục theo dõi các phản ứng của bé và ghi chép lại các thông số mới nếu cần.'
          }
        ];
      case 'NUTRITION':
        return [
          {
            title: 'Định lượng thức ăn',
            desc: 'Chuẩn bị thức ăn sạch sẽ và định lượng hạt phù hợp cho cân nặng thú cưng.'
          },
          {
            title: 'Đặt bát thức ăn',
            desc: 'Đặt bát thức ăn tại nơi yên tĩnh để thú cưng thoải mái ăn uống không bị làm phiền.'
          },
          {
            title: 'Vệ sinh bát đĩa',
            desc: 'Rửa sạch bát và thay nước uống mới sau khi thú cưng hoàn thành bữa ăn.'
          }
        ];
      case 'DAILY_ROUTINE':
        return [
          {
            title: 'Chuẩn bị dụng cụ',
            desc: 'Kiểm tra thời tiết (nếu đi dạo) hoặc chuẩn bị cát sạch & xẻng lọc (nếu dọn vệ sinh).'
          },
          {
            title: 'Thực hiện chu đáo',
            desc: 'Đồng hành dắt thú cưng đi dạo thư giãn hoặc dọn sạch khay vệ sinh chu đáo.'
          },
          {
            title: 'Dọn dẹp & Khử trùng',
            desc: 'Vứt chất thải đúng nơi quy định và rửa sạch tay bằng xà phòng sát khuẩn.'
          }
        ];
      case 'TRAINING':
        return [
          {
            title: 'Chọn khu vực cố định',
            desc: 'Xác định nơi bạn muốn thú cưng đi vệ sinh, có thể là khay vệ sinh hoặc tấm lót chuyên dụng.'
          },
          {
            title: 'Theo dõi lịch trình ăn uống',
            desc: 'Dắt thú cưng ra khu vực vệ sinh ngay sau khi ăn 15–20 phút hoặc ngay sau khi ngủ dậy.'
          },
          {
            title: 'Khen thưởng ngay lập tức',
            desc: 'Sử dụng bánh thưởng (treat) hoặc lời khen hào hứng khi cún làm đúng chỗ.'
          }
        ];
      default:
        return [
          {
            title: 'Kiểm tra tổng quát',
            desc: 'Xem xét và kiểm tra tình trạng cơ thể thú cưng để phát hiện các dấu hiệu bất thường.'
          },
          {
            title: 'Thực hiện nhẹ nhàng',
            desc: 'Tiến hành thao tác chăm sóc nhẹ nhàng và từ tốn để tránh làm thú cưng hoảng sợ.'
          },
          {
            title: 'Gắn kết tình cảm',
            desc: 'Khen ngợi, vỗ về bé và dọn dẹp các dụng cụ chăm sóc.'
          }
        ];
    }
  };

  const renderDetailMode = () => {
    if (!quest) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={{ color: bgColors.text }}>Không tìm thấy thông tin nhiệm vụ.</Text>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={{ color: bgColors.accentRed, fontWeight: 'bold', marginTop: 12 }}>← Quay lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const isCompleted = quest.status === 'COMPLETED';
    const steps = getCategorySteps(quest.category, quest.source_knowledge_id);

    return (
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={bgColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: bgColors.text }]} numberOfLines={1}>
            {quest.title}
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => Alert.alert('Chia sẻ', 'Tính năng chia sẻ đang được phát triển.')}>
            <Ionicons name="share-outline" size={22} color={bgColors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Video Player Simulation */}
          <View style={styles.videoPlayer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600' }} 
              style={styles.videoThumbnail} 
            />
            <View style={styles.videoOverlay} />
            
            <View style={styles.playButtonWrap}>
              <Ionicons name="play" size={32} color="#fff" style={{ marginLeft: 4 }} />
            </View>

            <View style={styles.videoControls}>
              <Text style={styles.timeText}>0:37</Text>
              <View style={styles.timeBar}>
                <View style={[styles.timeFill, { width: '25%' }]} />
              </View>
              <Text style={styles.timeText}>2:23</Text>
            </View>
          </View>

          {/* Section title */}
          <Text style={[styles.sectionTitle, { color: bgColors.text }]}>Các bước thực hiện</Text>
          
          {/* Steps Timeline */}
          <View style={styles.timeline}>
            {steps.map((step, idx) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={styles.timelineCircle}>
                    <Text style={styles.timelineNumber}>{idx + 1}</Text>
                  </View>
                  {idx < steps.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={[styles.stepTitle, { color: bgColors.text }]}>{step.title}</Text>
                  <Text style={[styles.stepDesc, { color: bgColors.subtext }]}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tips Box */}
          <View style={[styles.tipsBox, { backgroundColor: bgColors.redBg, borderColor: bgColors.redBorder }]}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={18} color={bgColors.accentRed} />
              <Text style={styles.tipsTitleText}>MẸO NHỎ CHO BẠN</Text>
            </View>
            <Text style={styles.tipsBullet}>
              • Kiên trì là chìa khóa, đừng bao giờ mắng mỏ khi chúng lỡ làm sai.
            </Text>
            <Text style={styles.tipsBullet}>
              • Vệ sinh sạch sẽ chỗ cũ nếu cún đi sai để xóa mùi hương.
            </Text>
          </View>
        </ScrollView>

        {/* Footer completion button */}
        <View style={[styles.footer, { backgroundColor: bgColors.card, borderTopColor: bgColors.border }]}>
          {isCompleted ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={bgColors.accentGreen} />
              <Text style={styles.completedBadgeText}>Nhiệm vụ đã hoàn thành ✓</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.doneBtn, completing && { opacity: 0.7 }]} 
              onPress={handleComplete}
              disabled={completing}
            >
              {completing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.doneBtnText}>Xác nhận hoàn thành</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderListMode = () => {
    // Determine the list items based on active tab
    let displayedQuests = questsList;

    const currentLevel = selectedPet?.stats?.level || 12;
    const currentXp = selectedPet?.stats?.xp || 1200;
    const targetXp = selectedPet?._id?.startsWith('mock_') ? 1800 : (currentLevel * 100 + 800);
    const xpPercent = Math.min(100, Math.max(0, (currentXp / targetXp) * 100));

    return (
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={bgColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: bgColors.text }]}>Nhiệm vụ</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => Alert.alert('Trợ giúp', 'Hoàn thành các nhiệm vụ hàng ngày để giúp thú cưng của bạn phát triển tốt hơn.')}>
            <Ionicons name="help-circle-outline" size={24} color={bgColors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressCardHeader}>
              <View>
                <Text style={styles.progressLabel}>Tiến độ hiện tại</Text>
                <Text style={styles.progressSubLabel}>XP to Level {currentLevel + 1}</Text>
              </View>
              <View style={styles.leftBadge}>
                <Text style={styles.leftBadgeText}>12 Left</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${xpPercent}%` }]} />
            </View>

            <View style={styles.progressCardFooter}>
              <Text style={styles.progressValueText}>{currentXp} / {targetXp} XP</Text>
              <View style={styles.trendBadge}>
                <Ionicons name="trending-up" size={14} color={bgColors.accentRed} style={{ marginRight: 3 }} />
                <Text style={styles.trendBadgeText}>Top 10% tuần này!</Text>
              </View>
            </View>
          </View>

          {/* Segment tabs */}
          <View style={styles.tabsContainer}>
            {(['daily', 'weekly', 'monthly', 'annual'] as const).map((tab) => {
              const isActive = activeTab === tab;
              let label = 'Daily';
              if (tab === 'weekly') label = 'Weekly';
              else if (tab === 'monthly') label = 'Monthly';
              else if (tab === 'annual') label = 'Annual Goals';

              return (
                <TouchableOpacity 
                  key={tab} 
                  style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quest items list */}
          <View style={styles.listContainer}>
            {displayedQuests.length === 0 ? (
              <Text style={styles.emptyText}>Không có nhiệm vụ nào.</Text>
            ) : (
              displayedQuests.map((item) => {
                const isLocked = !!item.isLocked;
                const isCompleted = item.status === 'COMPLETED';
                let coinReward = item.reward_coin !== undefined ? item.reward_coin : 10;
                if (item._id?.startsWith('mock_')) {
                  if (item.reward_xp === 30) coinReward = 15;
                  if (item.reward_xp >= 100) coinReward = 30;
                }

                return (
                  <TouchableOpacity
                    key={item._id}
                    style={[styles.questCard, isLocked && { opacity: 0.6 }]}
                    onPress={() => {
                      if (isLocked) {
                        const remainingTime = item.unlocksAt ? getCountdownText(item.unlocksAt) : '5 giờ';
                        showAlert(
                          'Bữa ăn đang khóa 🔒',
                          `Khoảng cách giữa các bữa ăn dinh dưỡng phải cách nhau ít nhất 5 giờ. Vui lòng đợi thêm ${remainingTime} nữa.`
                        );
                      } else {
                        // Navigate to detail mode
                        router.push({
                          pathname: '/mission-detail',
                          params: { questId: item._id }
                        } as any);
                      }
                    }}
                  >
                    <View style={styles.questCardLeft}>
                      <View style={[
                        styles.checkbox, 
                        isLocked ? { borderColor: '#B0BEC5', backgroundColor: '#ECEFF1' } :
                        isCompleted ? styles.checkboxChecked : styles.checkboxPending
                      ]}>
                        {isLocked ? (
                          <Ionicons name="lock-closed" size={12} color="#8A9AA9" />
                        ) : isCompleted ? (
                          <Ionicons name="checkmark" size={12} color={bgColors.accentRed} />
                        ) : null}
                      </View>
                      <View style={styles.questInfo}>
                        <Text style={styles.questTitleText}>{item.title}</Text>
                        <Text style={styles.questDescText}>
                          {isLocked ? `Chưa đến giờ ăn tiếp theo. ${item.lockMessage || ''}` : item.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.questCardRight}>
                      <Text style={styles.rewardText}>+{item.reward_xp} XP</Text>
                      <Text style={styles.rewardCoins}>{coinReward} Coins</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            {/* Extra reward checklist item */}
            {activeTab === 'daily' && (
              <TouchableOpacity 
                style={styles.extraRewardCard}
                onPress={() => Alert.alert('Chuỗi nhiệm vụ', 'Hoàn thành chuỗi 5 nhiệm vụ ngày liên tiếp để nhận rương 100 Coins thưởng thêm.')}
              >
                <View style={styles.extraRewardLeft}>
                  <View style={styles.extraRewardIconWrap}>
                    <Ionicons name="star" size={16} color="#fff" />
                  </View>
                  <View style={styles.extraRewardInfo}>
                    <Text style={styles.extraRewardTitle}>Chuỗi nhiệm vụ thưởng thêm</Text>
                    <Text style={styles.extraRewardDesc}>Hoàn thành 5 nhiệm vụ để nhận thêm 100 Coins</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={bgColors.subtext} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColors.main }]} edges={['top']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={bgColors.accentRed} />
        </View>
      ) : isDetailMode ? (
        renderDetailMode()
      ) : (
        renderListMode()
      )}

      {/* SUCCESS CELEBRATION MODAL */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.modalOverlay}>
          {/* Confetti & Fireworks Effects */}
          <CelebrationEffect />

          <View style={styles.modalCard}>
            <View style={styles.modalCrownIconWrap}>
              <Ionicons name="trophy" size={42} color="#FFB000" />
            </View>

            <Text style={styles.modalTitle}>Hoàn thành xuất sắc! 🎉</Text>
            <Text style={styles.modalSubtitle}>
              Bạn và thú cưng đang thực hiện thói quen chăm sóc rất tốt! Hãy tiếp tục phát huy nhé.
            </Text>

            {/* Rewards Cards */}
            <View style={styles.modalRewardsContainer}>
              <View style={[styles.modalRewardCard, { backgroundColor: '#E8F8F0', borderColor: '#27AE6033' }]}>
                <Ionicons name="star" size={24} color="#27AE60" />
                <Text style={styles.modalRewardVal}>+{successRewards?.xp || 0}</Text>
                <Text style={styles.modalRewardLbl}>Kinh nghiệm (XP)</Text>
              </View>

              <View style={[styles.modalRewardCard, { backgroundColor: '#FFF9E6', borderColor: '#FFB00033' }]}>
                <Ionicons name="cash" size={24} color="#FFB000" />
                <Text style={styles.modalRewardVal}>+{successRewards?.coins || 0}</Text>
                <Text style={styles.modalRewardLbl}>Tiền xu (Coins)</Text>
              </View>
            </View>

            {/* Level Up alert */}
            {successRewards?.leveledUp && (
              <View style={styles.modalLevelUpBox}>
                <Ionicons name="ribbon" size={20} color="#EC4B4B" style={{ marginRight: 8 }} />
                <Text style={styles.modalLevelUpText}>
                  Thú cưng đã thăng cấp lên CẤP {successRewards?.currentLevel || 2}! 🌟
                </Text>
              </View>
            )}

            {/* Unlocked Achievements list */}
            {successRewards?.unlockedAchievements && successRewards.unlockedAchievements.length > 0 && (
              <View style={styles.modalAchievementsBox}>
                <Text style={styles.modalAchievementsTitle}>🏆 THÀNH TỰU MỚI ĐẠT ĐƯỢC!</Text>
                {successRewards.unlockedAchievements.map((title, idx) => (
                  <View key={idx} style={styles.modalAchievementItem}>
                    <Ionicons name="trophy" size={15} color="#FFB000" style={{ marginRight: 8 }} />
                    <Text style={styles.modalAchievementText}>{title}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.modalBtn} onPress={handleCloseSuccessModal}>
              <Text style={styles.modalBtnText}>Nhận phần thưởng</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BEAUTIFUL CUSTOM ALERT MODAL */}
      <Modal
        visible={alertVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAlertVisible(false)}
      >
        <View style={styles.alertOverlay}>
          <Animated.View style={[styles.alertCard, { transform: [{ scale: alertScale }] }]}>
            <View style={[styles.alertIconCircle, { backgroundColor: '#FFF0F0' }]}>
              <Ionicons name="lock-closed" size={32} color="#EC4B4B" />
            </View>
            <Text style={styles.alertTitle}>{alertTitle}</Text>
            <Text style={styles.alertMessage}>{alertMessage}</Text>
            <TouchableOpacity style={styles.alertBtn} onPress={() => setAlertVisible(false)}>
              <Text style={styles.alertBtnText}>Đồng ý</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
    paddingVertical: 16, 
    backgroundColor: '#fff',
    borderBottomWidth: 1, 
    borderBottomColor: '#FFEBEB' 
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center', marginHorizontal: 12 },
  content: { padding: 20, paddingBottom: 40 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backLink: { padding: 10 },

  /* ========================================================
     DETAIL MODE STYLES
     ======================================================== */
  videoPlayer: { 
    width: '100%', 
    height: 220, 
    backgroundColor: '#1a1a1a', 
    borderRadius: 24, 
    overflow: 'hidden', 
    marginBottom: 24, 
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  playButtonWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  videoControls: { 
    position: 'absolute', 
    bottom: 16, 
    left: 16, 
    right: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  timeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  timeBar: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  timeFill: { height: '100%', backgroundColor: '#EC4B4B', borderRadius: 2 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  
  timeline: { marginBottom: 12 },
  timelineItem: { flexDirection: 'row', marginBottom: 8 },
  timelineLeft: { alignItems: 'center', marginRight: 16 },
  timelineCircle: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: '#EC4B4B', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 2,
  },
  timelineNumber: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  timelineLine: { 
    position: 'absolute', 
    top: 28, 
    bottom: -16, 
    width: 2, 
    backgroundColor: '#FFEBEB',
    zIndex: 1,
  },
  timelineRight: { flex: 1, paddingBottom: 24 },
  stepTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  stepDesc: { fontSize: 13, lineHeight: 20, fontWeight: '500' },

  tipsBox: { padding: 20, borderRadius: 24, borderWidth: 1, gap: 10 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tipsTitleText: { fontSize: 12, fontWeight: 'bold', color: '#EC4B4B', marginLeft: 8 },
  tipsBullet: { fontSize: 13, color: '#1B2530', lineHeight: 20, fontWeight: '500' },

  footer: { padding: 20, borderTopWidth: 1 },
  doneBtn: { backgroundColor: '#EC4B4B', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 18, borderRadius: 24 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  completedBadge: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 18, borderRadius: 24, backgroundColor: '#E2FBE9', borderWidth: 1, borderColor: '#C8E6C9' },
  completedBadgeText: { color: '#27AE60', fontSize: 16, fontWeight: 'bold' },

  /* ========================================================
     LIST MODE STYLES
     ======================================================== */
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFEBEB',
    marginBottom: 20,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  progressLabel: {
    fontSize: 11,
    color: '#8A9AA9',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  progressSubLabel: {
    fontSize: 15,
    color: '#1B2530',
    fontWeight: 'bold',
  },
  leftBadge: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  leftBadgeText: {
    fontSize: 11,
    color: '#EC4B4B',
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#FFF0F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EC4B4B',
    borderRadius: 5,
  },
  progressCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressValueText: {
    fontSize: 12,
    color: '#8A9AA9',
    fontWeight: 'bold',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendBadgeText: {
    fontSize: 10,
    color: '#EC4B4B',
    fontWeight: 'bold',
  },

  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEBEB',
    paddingBottom: 4,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#EC4B4B',
  },
  tabBtnText: {
    fontSize: 13,
    color: '#8A9AA9',
    fontWeight: 'bold',
  },
  tabBtnTextActive: {
    color: '#EC4B4B',
  },

  listContainer: {
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8A9AA9',
    marginVertical: 20,
    fontWeight: 'bold',
  },
  questCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFEBEB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkboxChecked: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFEBEB',
  },
  checkboxPending: {
    borderColor: '#EC4B4B',
    backgroundColor: 'transparent',
  },
  questInfo: {
    flex: 1,
    marginRight: 10,
  },
  questTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B2530',
    marginBottom: 4,
  },
  questDescText: {
    fontSize: 12,
    color: '#8A9AA9',
    fontWeight: 'bold',
  },
  questCardRight: {
    alignItems: 'flex-end',
  },
  rewardText: {
    fontSize: 12,
    color: '#EC4B4B',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  rewardCoins: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: 'bold',
  },

  extraRewardCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFEBEB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  extraRewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  extraRewardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EC4B4B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  extraRewardInfo: {
    flex: 1,
  },
  extraRewardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B2530',
    marginBottom: 4,
  },
  extraRewardDesc: {
    fontSize: 11,
    color: '#8A9AA9',
    fontWeight: 'bold',
  },
  
  // SUCCESS CELEBRATION MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 37, 48, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#FFEBEB',
  },
  modalCrownIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FFF0D0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B2530',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8A9AA9',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  modalRewardsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  modalRewardCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalRewardVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B2530',
    marginTop: 8,
    marginBottom: 2,
  },
  modalRewardLbl: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#8A9AA9',
    textTransform: 'uppercase',
  },
  modalLevelUpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFEBEB',
  },
  modalLevelUpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EC4B4B',
  },
  modalBtn: {
    backgroundColor: '#EC4B4B',
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EC4B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalAchievementsBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFB00033',
    width: '100%',
  },
  modalAchievementsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFB000',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalAchievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalAchievementText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B2530',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 37, 48, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#FFEBEB',
  },
  alertIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B2530',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 13,
    color: '#8A9AA9',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  alertBtn: {
    backgroundColor: '#EC4B4B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#EC4B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  alertBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
