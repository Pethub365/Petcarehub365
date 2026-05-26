import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Modal, TextInput, useColorScheme, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import familyApi from '../apis/familyApi';
import dailyQuestApi from '../apis/dailyQuestApi';

export default function FamilyManagementScreen() {
  const isDark = useColorScheme() === 'dark';

  const bgColors = {
    main: isDark ? '#121212' : '#F8F9FA',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1B2530',
    subtext: isDark ? '#A0AEC0' : '#8A9AA9',
    border: isDark ? '#2D3748' : '#F1F3F5',
    primary: '#EC4B4B',
    pinkBg: isDark ? '#2D1B1B' : '#FFF5F5',
    pinkBorder: isDark ? '#4A2B2B' : '#FFEBEB',
  };

  const [loading, setLoading] = useState(true);
  const [familyGroup, setFamilyGroup] = useState<any | null>(null);
  const [familyQuests, setFamilyQuests] = useState<any[]>([]);

  // Modals visibility
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [showQuestsSection, setShowQuestsSection] = useState(false);

  // Form states
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedQuest, setSelectedQuest] = useState<any | null>(null);

  // Loading indicator for actions
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      const res = await familyApi.getFamilyGroup() as any;
      if (res && res.success && res.data) {
        setFamilyGroup(res.data);
        
        // If there are pets in the family, load their quests in parallel
        const pets = res.data.pet_ids || [];
        if (pets.length > 0) {
          const questPromises = pets.map(async (pet: any) => {
            try {
              const qRes = await dailyQuestApi.getDailyQuests(pet._id) as any;
              if (qRes && qRes.success) {
                return qRes.data.quests.map((q: any) => ({
                  ...q,
                  petName: pet.name,
                }));
              }
            } catch (err) {
              console.error(`Error loading quests for pet ${pet._id}:`, err);
            }
            return [];
          });
          const allQuestsArray = await Promise.all(questPromises);
          const flatQuests = allQuestsArray.flat();
          setFamilyQuests(flatQuests);
        } else {
          setFamilyQuests([]);
        }
      } else {
        setFamilyGroup(null);
        setFamilyQuests([]);
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên nhóm gia đình');
      return;
    }
    try {
      setSubmitting(true);
      const res = await familyApi.createFamilyGroup({ group_name: groupName }) as any;
      setSubmitting(false);
      if (res && res.success) {
        Alert.alert('Thành công', res.message || 'Tạo nhóm gia đình thành công!');
        setGroupName('');
        setCreateModalVisible(false);
        fetchFamilyData();
      }
    } catch (error: any) {
      setSubmitting(false);
      Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi tạo nhóm gia đình.');
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã mời');
      return;
    }
    try {
      setSubmitting(true);
      const res = await familyApi.joinFamily(inviteCode) as any;
      setSubmitting(false);
      if (res && res.success) {
        Alert.alert('Thành công', res.message || 'Gia nhập nhóm gia đình thành công!');
        setInviteCode('');
        setJoinModalVisible(false);
        fetchFamilyData();
      }
    } catch (error: any) {
      setSubmitting(false);
      Alert.alert('Lỗi', error.response?.data?.message || 'Mã mời không đúng hoặc đã hết hạn.');
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ email');
      return;
    }
    try {
      setSubmitting(true);
      const res = await familyApi.inviteMember(inviteEmail) as any;
      setSubmitting(false);
      if (res && res.success) {
        Alert.alert('Thành công', res.message || `Đã gửi mã mời thành công tới ${inviteEmail}`);
        setInviteEmail('');
        setInviteModalVisible(false);
      }
    } catch (error: any) {
      setSubmitting(false);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi lời mời. Hãy chắc chắn bạn là ADMIN của nhóm.');
    }
  };

  const handleAssignQuest = async (memberId: string | null) => {
    if (!selectedQuest) return;
    try {
      setSubmitting(true);
      const res = await familyApi.assignQuest(selectedQuest._id, memberId) as any;
      setSubmitting(false);
      if (res && res.success) {
        Alert.alert('Thành công', res.message || 'Phân công nhiệm vụ thành công!');
        setAssignModalVisible(false);
        setSelectedQuest(null);
        fetchFamilyData();
      }
    } catch (error: any) {
      setSubmitting(false);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể phân công nhiệm vụ.');
    }
  };

  const openAssignModal = (quest: any) => {
    setSelectedQuest(quest);
    setAssignModalVisible(true);
  };

  // Helper: Trả về tên hiển thị của người được phân công
  const getAssigneeName = (assignedToId: string) => {
    if (!familyGroup) {
      if (assignedToId === 'mock-luc') return 'Nguyễn Trọng Lực';
      if (assignedToId === 'mock-ha') return 'Lê Thu Hà';
      return 'Chưa phân công';
    }
    const member = familyGroup.members.find((m: any) => m.user_id._id === assignedToId);
    return member ? (member.user_id.profile?.full_name || member.user_id.email) : 'Chưa phân công';
  };

  const getQuestIcon = (category: string) => {
    switch (category) {
      case 'NUTRITION': return { name: 'fork.knife', color: '#FF9F43' };
      case 'DAILY_ROUTINE': return { name: 'figure.walk', color: '#3B82F6' };
      case 'HEALTH_CARE': return { name: 'heart.fill', color: '#2ECC71' };
      case 'TRAINING': return { name: 'scissors', color: '#C462FF' };
      default: return { name: 'doc.text.fill', color: '#8A9AA9' };
    }
  };

  // Setup Mock Preview data if API doesn't return group (to match Figma)
  const isMockPreview = !familyGroup;
  
  const displayPet = (familyGroup?.pet_ids && familyGroup.pet_ids.length > 0)
    ? familyGroup.pet_ids[0]
    : {
        _id: 'mock-mochi',
        name: 'Mochi the Corgi',
        avatar_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200',
        member_count: 'Thành viên chung'
      };

  const displayMembers = (familyGroup?.members && familyGroup.members.length > 0)
    ? familyGroup.members
    : [
        {
          user_id: {
            _id: 'mock-luc',
            email: 'luc.nguyen@petcarehub.vn',
            profile: {
              full_name: 'Nguyễn Trọng Lực',
              avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150'
            }
          },
          role: 'ADMIN'
        },
        {
          user_id: {
            _id: 'mock-ha',
            email: 'ha.le@petcarehub.vn',
            profile: {
              full_name: 'Lê Thu Hà',
              avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150'
            }
          },
          role: 'MEMBER'
        }
      ];

  const displayQuests = !isMockPreview ? familyQuests : [
    {
      _id: 'q1',
      title: 'Cho Mochi ăn sáng',
      description: 'Cung cấp hạt hạt giàu dinh dưỡng và nước sạch',
      category: 'NUTRITION',
      assigned_to: 'mock-luc',
      status: 'COMPLETED',
      petName: 'Mochi'
    },
    {
      _id: 'q2',
      title: 'Đi dạo buổi chiều',
      description: 'Đi bộ thể dục tối thiểu 15 phút quanh công viên',
      category: 'DAILY_ROUTINE',
      assigned_to: 'mock-ha',
      status: 'PENDING',
      petName: 'Mochi'
    },
    {
      _id: 'q3',
      title: 'Chải lông và làm sạch tai',
      description: 'Chải lông gỡ rối và vệ sinh tai cho bé',
      category: 'TRAINING',
      assigned_to: null,
      status: 'PENDING',
      petName: 'Mochi'
    }
  ];

  const showHelpAlert = () => {
    Alert.alert(
      'Quản lý Gia đình',
      'Tính năng này giúp bạn chia sẻ trách nhiệm chăm sóc bé cưng của mình với những thành viên khác trong gia đình. Cùng cập nhật hồ sơ sức khỏe và phân chia các công việc hàng ngày!'
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColors.main }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={bgColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColors.main }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColors.card, borderBottomColor: bgColors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={bgColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: bgColors.text }]}>Quản lý Gia đình</Text>
        <TouchableOpacity onPress={showHelpAlert} style={styles.helpBtn}>
          <View style={styles.helpIconWrap}>
            <Text style={styles.helpText}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Banner Alert for Mock Preview mode (offers quick Actions) */}
        {isMockPreview && (
          <View style={[styles.previewBanner, { backgroundColor: bgColors.pinkBg, borderColor: bgColors.pinkBorder }]}>
            <View style={styles.previewBannerHeader}>
              <IconSymbol name="sparkles" size={16} color={bgColors.primary} />
              <Text style={[styles.previewBannerTitle, { color: bgColors.primary }]}>Chế độ xem trước Figma</Text>
            </View>
            <Text style={[styles.previewBannerText, { color: bgColors.text }]}>
              Bạn chưa thiết lập nhóm gia đình. Tạo nhóm mới hoặc gia nhập nhóm của người thân:
            </Text>
            <View style={styles.previewBtnRow}>
              <TouchableOpacity style={[styles.previewBtn, { backgroundColor: bgColors.primary }]} onPress={() => setCreateModalVisible(true)}>
                <Text style={styles.previewBtnText}>Tạo nhóm mới</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.previewBtn, styles.previewBtnOutline, { borderColor: bgColors.primary }]} onPress={() => setJoinModalVisible(true)}>
                <Text style={[styles.previewBtnTextOutline, { color: bgColors.primary }]}>Gia nhập nhóm</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Pet Card Section */}
        <TouchableOpacity 
          style={[styles.petCard, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}
          onPress={() => router.push('/(tabs)/pets')}
          activeOpacity={0.8}
        >
          <Image 
            source={{ uri: displayPet.avatar_url }} 
            style={styles.petAvatarImage} 
          />
          <View style={styles.petInfo}>
            <Text style={[styles.petNameText, { color: bgColors.text }]}>{displayPet.name}</Text>
            <View style={styles.statusRow}>
              <IconSymbol name="person.3.fill" size={14} color={bgColors.primary} />
              <Text style={[styles.statusText, { color: bgColors.primary }]}>Thành viên chung</Text>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={20} color={bgColors.subtext} />
        </TouchableOpacity>

        {/* Members section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: bgColors.text }]}>Thành viên gia đình</Text>
          <TouchableOpacity 
            onPress={() => setInviteModalVisible(true)} 
            style={[styles.addMemberBtn, { backgroundColor: bgColors.pinkBg }]}
          >
            <IconSymbol name="person.badge.plus" size={18} color={bgColors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.membersWrapper}>
          {displayMembers.map((member: any, idx: number) => {
            const isMemberAdmin = member.role === 'ADMIN';
            const memberName = member.user_id.profile?.full_name || member.user_id.email;
            const avatarUrl = member.user_id.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';
            
            return (
              <View key={member.user_id._id} style={[styles.memberCard, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
                <Image source={{ uri: avatarUrl }} style={styles.memberAvatarImage} />
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: bgColors.text }]}>{memberName}</Text>
                  
                  <View style={styles.badgeRow}>
                    <View style={[
                      styles.roleBadge, 
                      isMemberAdmin 
                        ? { backgroundColor: bgColors.pinkBg, borderColor: bgColors.pinkBorder } 
                        : { backgroundColor: '#F0F4F8', borderColor: '#E2E8F0' }
                    ]}>
                      <Text style={[
                        styles.roleText, 
                        isMemberAdmin ? { color: bgColors.primary } : { color: bgColors.subtext }
                      ]}>
                        {isMemberAdmin ? 'CHỦ HỘ' : 'THÀNH VIÊN'}
                      </Text>
                    </View>
                  </View>
                </View>
                {isMemberAdmin ? (
                  <IconSymbol name="checkmark.seal.fill" size={20} color={bgColors.primary} />
                ) : (
                  <TouchableOpacity onPress={() => Alert.alert('Tùy chọn', 'Quản lý thông tin thành viên gia đình.')}>
                    <IconSymbol name="ellipsis" size={20} color={bgColors.subtext} style={{ transform: [{ rotate: '90deg' }] }} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Shared Utilities Section */}
        <Text style={[styles.sectionTitle, { color: bgColors.text, marginTop: 24, marginBottom: 12 }]}>Tiện ích chung</Text>
        
        <View style={styles.utilitiesList}>
          {/* Common Dashboard */}
          <TouchableOpacity 
            style={[styles.utilityCard, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}
            onPress={() => router.push('/(tabs)')}
          >
            <View style={[styles.utilityIconWrap, { backgroundColor: '#FFF5EB' }]}>
              <IconSymbol name="square.grid.2x2.fill" size={20} color="#FF9F43" />
            </View>
            <View style={styles.utilityTextWrap}>
              <Text style={[styles.utilityTitle, { color: bgColors.text }]}>Bảng điều khiển chung</Text>
              <Text style={[styles.utilitySubtitle, { color: bgColors.subtext }]}>Xem mọi hoạt động của thú cưng</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={bgColors.subtext} />
          </TouchableOpacity>

          {/* Task Assignment */}
          <TouchableOpacity 
            style={[styles.utilityCard, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}
            onPress={() => setShowQuestsSection(!showQuestsSection)}
          >
            <View style={[styles.utilityIconWrap, { backgroundColor: '#EBF5FF' }]}>
              <IconSymbol name="checklist" size={20} color="#3B82F6" />
            </View>
            <View style={styles.utilityTextWrap}>
              <Text style={[styles.utilityTitle, { color: bgColors.text }]}>Phân công công việc</Text>
              <Text style={[styles.utilitySubtitle, { color: bgColors.subtext }]}>
                {showQuestsSection ? 'Ẩn bảng phân công công việc' : 'Chia sẻ lịch chăm sóc, cho ăn'}
              </Text>
            </View>
            <IconSymbol 
              name="chevron.right" 
              size={20} 
              color={bgColors.subtext} 
              style={{ transform: [{ rotate: showQuestsSection ? '90deg' : '0deg' }] }} 
            />
          </TouchableOpacity>

          {/* Common Health Records */}
          <TouchableOpacity 
            style={[styles.utilityCard, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}
            onPress={() => router.push('/health-dashboard')}
          >
            <View style={[styles.utilityIconWrap, { backgroundColor: '#EAFDF7' }]}>
              <IconSymbol name="cross.case.fill" size={20} color="#2ECC71" />
            </View>
            <View style={styles.utilityTextWrap}>
              <Text style={[styles.utilityTitle, { color: bgColors.text }]}>Hồ sơ sức khỏe chung</Text>
              <Text style={[styles.utilitySubtitle, { color: bgColors.subtext }]}>Cập nhật lịch tiêm chủng & khám</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={bgColors.subtext} />
          </TouchableOpacity>
        </View>

        {/* Quests Assignment List (Toggled by Utility) */}
        {showQuestsSection && (
          <View style={styles.questsSection}>
            <Text style={[styles.sectionTitle, { color: bgColors.text, marginBottom: 12 }]}>Phân công chi tiết</Text>
            {displayQuests.length === 0 ? (
              <View style={[styles.questCardEmpty, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}>
                <IconSymbol name="checklist" size={32} color={bgColors.subtext} />
                <Text style={[styles.questCardEmptyText, { color: bgColors.subtext }]}>
                  Không tìm thấy nhiệm vụ nào cần phân công cho hôm nay.
                </Text>
              </View>
            ) : (
              <View style={styles.questAssignList}>
                {displayQuests.map((quest: any) => {
                  const questIcon = getQuestIcon(quest.category);
                  const assigneeName = quest.assigned_to ? getAssigneeName(quest.assigned_to) : 'Chưa phân công';
                  const isAssigned = !!quest.assigned_to;
                  const isCompleted = quest.status === 'COMPLETED';

                  return (
                    <TouchableOpacity
                      key={quest._id}
                      style={[styles.questAssignItem, { backgroundColor: bgColors.card, borderColor: bgColors.border }]}
                      onPress={() => openAssignModal(quest)}
                    >
                      <View style={[styles.questIconWrap, { backgroundColor: questIcon.color + '15' }]}>
                        <IconSymbol name={questIcon.name as any} size={18} color={questIcon.color} />
                      </View>

                      <View style={styles.questAssignInfo}>
                        <View style={styles.questTitleRow}>
                          <Text style={[styles.questAssignTitle, { color: bgColors.text }, isCompleted && styles.completedQuestText]} numberOfLines={1}>
                            {quest.title}
                          </Text>
                          <Text style={styles.questPetBadge}>{quest.petName}</Text>
                        </View>
                        <Text style={styles.questAssignDesc} numberOfLines={1}>{quest.description}</Text>
                        
                        <View style={styles.assignBadgeRow}>
                          <View style={[styles.assigneePill, isAssigned ? styles.assigneePillActive : styles.assigneePillEmpty]}>
                            <IconSymbol name="person.fill" size={10} color={isAssigned ? bgColors.primary : bgColors.subtext} />
                            <Text style={[styles.assigneeText, isAssigned ? styles.assigneeTextActive : styles.assigneeTextEmpty, { color: isAssigned ? bgColors.primary : bgColors.subtext }]}>
                              {assigneeName}
                            </Text>
                          </View>
                          {isCompleted && (
                            <View style={styles.completedBadgePill}>
                              <Text style={styles.completedBadgePillText}>Đã xong ✓</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <IconSymbol name="ellipsis" size={20} color={bgColors.subtext} style={{ transform: [{ rotate: '90deg' }] }} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity style={[styles.inviteBtn, { backgroundColor: bgColors.primary }]} onPress={() => setInviteModalVisible(true)}>
          <IconSymbol name="envelope.fill" size={18} color="#FFFFFF" />
          <Text style={styles.inviteBtnText}>Mời thành viên mới</Text>
        </TouchableOpacity>
        <Text style={[styles.infoText, { color: bgColors.subtext }]}>
          Người được mời sẽ có quyền truy cập vào hồ sơ của {displayPet.name}
        </Text>

      </ScrollView>

      {/* Invite Member Modal */}
      <Modal animationType="fade" transparent visible={inviteModalVisible} onRequestClose={() => setInviteModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: bgColors.card }]}>
            <Text style={[styles.modalTitle, { color: bgColors.text }]}>Mời thành viên mới</Text>
            <Text style={[styles.modalDesc, { color: bgColors.subtext }]}>
              Nhập địa chỉ email người thân của bạn. Hệ thống sẽ gửi một mã mời để họ gia nhập gia đình này.
            </Text>
            <TextInput
              placeholder="nhap-email@example.com"
              style={[styles.modalInput, { borderColor: bgColors.border, color: bgColors.text }]}
              value={inviteEmail}
              onChangeText={inviteEmail => setInviteEmail(inviteEmail)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#A0AEC0"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setInviteModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn, { backgroundColor: bgColors.primary }]} onPress={handleInviteMember} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Gửi lời mời</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Family Group Modal */}
      <Modal animationType="fade" transparent visible={createModalVisible} onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: bgColors.card }]}>
            <Text style={[styles.modalTitle, { color: bgColors.text }]}>Tạo nhóm gia đình mới</Text>
            <Text style={[styles.modalDesc, { color: bgColors.subtext }]}>
              Đặt tên cho gia đình chăm sóc thú cưng của bạn (Ví dụ: Gia đình Mochi Corgi)
            </Text>
            <TextInput
              placeholder="Tên nhóm gia đình"
              style={[styles.modalInput, { borderColor: bgColors.border, color: bgColors.text }]}
              value={groupName}
              onChangeText={setGroupName}
              placeholderTextColor="#A0AEC0"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn, { backgroundColor: bgColors.primary }]} onPress={handleCreateGroup} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Tạo nhóm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Family Group Modal */}
      <Modal animationType="fade" transparent visible={joinModalVisible} onRequestClose={() => setJoinModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: bgColors.card }]}>
            <Text style={[styles.modalTitle, { color: bgColors.text }]}>Gia nhập gia đình</Text>
            <Text style={[styles.modalDesc, { color: bgColors.subtext }]}>
              Nhập mã mời gồm 6 chữ cái in hoa nhận được từ chủ nhóm.
            </Text>
            <TextInput
              placeholder="Nhập mã mời (Ví dụ: AX8K2P)"
              style={[styles.modalInput, styles.codeFormatInput, { borderColor: bgColors.border, color: bgColors.text }]}
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
              placeholderTextColor="#A0AEC0"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setJoinModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn, { backgroundColor: bgColors.primary }]} onPress={handleJoinGroup} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Gia nhập</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Quest Modal */}
      <Modal animationType="fade" transparent visible={assignModalVisible} onRequestClose={() => setAssignModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: bgColors.card, maxHeight: '80%' }]}>
            <Text style={[styles.modalTitle, { color: bgColors.text }]}>Phân công nhiệm vụ</Text>
            <Text style={[styles.modalDesc, { color: bgColors.subtext, marginBottom: 16 }]}>
              Chọn thành viên gia đình chịu trách nhiệm thực hiện nhiệm vụ: {'\n'}
              <Text style={{ fontWeight: 'bold', color: bgColors.text }}>{"\""}{selectedQuest?.title}{"\""}</Text>
            </Text>

            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
              {/* Option to unassign */}
              <TouchableOpacity
                style={[styles.assignOptionItem, { borderBottomColor: bgColors.border }]}
                onPress={() => handleAssignQuest(null)}
              >
                <View style={[styles.memberAvatarCircle, { backgroundColor: '#F1F3F5' }]}>
                  <IconSymbol name="xmark" size={16} color="#666" />
                </View>
                <Text style={[styles.assignOptionName, { color: bgColors.primary, fontWeight: 'bold' }]}>
                  Không phân công (Bỏ trống)
                </Text>
              </TouchableOpacity>

              {/* Family members options */}
              {displayMembers.map((member: any) => {
                const memberName = member.user_id.profile?.full_name || member.user_id.email;
                const avatarUrl = member.user_id.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';
                return (
                  <TouchableOpacity
                    key={member.user_id._id}
                    style={[styles.assignOptionItem, { borderBottomColor: bgColors.border }]}
                    onPress={() => handleAssignQuest(member.user_id._id)}
                  >
                    <Image source={{ uri: avatarUrl }} style={styles.assignOptionAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.assignOptionName, { color: bgColors.text }]}>{memberName}</Text>
                      <Text style={{ color: bgColors.subtext, fontSize: 11 }}>{member.user_id.email}</Text>
                    </View>
                    {selectedQuest?.assigned_to === member.user_id._id && (
                      <IconSymbol name="checkmark.circle.fill" size={20} color={bgColors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={[styles.modalBtnRow, { marginTop: 16 }]}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn, { width: '100%' }]} onPress={() => setAssignModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingVertical: 14, 
    borderBottomWidth: 1, 
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  helpBtn: { padding: 4 },
  helpIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EC4B4B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Preview Banner
  previewBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  previewBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  previewBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewBannerText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  previewBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  previewBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  previewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  previewBtnTextOutline: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Pet card styles
  petCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  petAvatarImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 12, 
    marginRight: 16, 
    resizeMode: 'cover',
  },
  petInfo: { flex: 1 },
  petNameText: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },

  // Members Section
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  addMemberBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membersWrapper: {
    gap: 12,
    marginBottom: 20,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  memberAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
  },

  // Utilities Section
  utilitiesList: {
    gap: 12,
  },
  utilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  utilityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  utilityTextWrap: {
    flex: 1,
  },
  utilityTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  utilitySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Quests styles (collapsed/expanded section)
  questsSection: {
    marginTop: 24,
  },
  questCardEmpty: { padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 8 },
  questCardEmptyText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  questAssignList: { gap: 12 },
  questAssignItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1 },
  questIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  questAssignInfo: { flex: 1, marginRight: 8 },
  questTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  questAssignTitle: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  completedQuestText: { textDecorationLine: 'line-through', opacity: 0.6 },
  questPetBadge: { backgroundColor: '#F1F3F5', fontSize: 9, color: '#8A9AA9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', fontWeight: '600' },
  questAssignDesc: { fontSize: 11, color: '#8A9AA9', marginBottom: 6 },
  assignBadgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  assigneePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  assigneePillActive: { backgroundColor: '#FFF5F5' },
  assigneePillEmpty: { backgroundColor: '#F1F3F5' },
  assigneeText: { fontSize: 10, fontWeight: '600' },
  assigneeTextActive: {},
  assigneeTextEmpty: {},
  completedBadgePill: { backgroundColor: '#EAFDF7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  completedBadgePillText: { color: '#2ECC71', fontSize: 9, fontWeight: 'bold' },

  // Bottom action
  inviteBtn: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8, 
    height: 54, 
    borderRadius: 27, 
    marginBottom: 10, 
    marginTop: 28,
    shadowColor: '#EC4B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  inviteBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  infoText: { textAlign: 'center', fontSize: 12, lineHeight: 18, marginBottom: 20 },

  // Modals styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 20, padding: 24, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalDesc: { fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  modalInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 48, width: '100%', marginBottom: 20, fontSize: 14 },
  codeFormatInput: { letterSpacing: 3, fontWeight: '700', fontSize: 18, textAlign: 'center' },
  modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F1F3F5' },
  cancelBtnText: { color: '#4A5568', fontWeight: '700' },
  saveBtn: { backgroundColor: '#EC4B4B' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700' },

  assignOptionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, width: '100%', gap: 12 },
  assignOptionName: { fontSize: 14, fontWeight: '600' },
  memberAvatarCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  assignOptionAvatar: { width: 36, height: 36, borderRadius: 18 },
});

