import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  ActivityIndicator, Alert, Platform, Modal, TextInput, KeyboardAvoidingView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import petApi from '../../apis/petApi';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for Edit Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSpecies, setEditSpecies] = useState('DOG'); // DOG | CAT | OTHER
  const [editSelectedBreed, setEditSelectedBreed] = useState('Poodle');
  const [editCustomBreed, setEditCustomBreed] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editGender, setEditGender] = useState('MALE');
  const [editDob, setEditDob] = useState('1.1.2026');
  const [editHealthStatus, setEditHealthStatus] = useState('NORMAL');
  const [editNeutered, setEditNeutered] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const dogBreeds = ['Poodle', 'Golden Retriever', 'Corgi', 'Husky', 'Chihuahua', 'Khác'];
  const catBreeds = ['British Shorthair', 'British Longhair', 'Persian', 'Scottish Fold', 'Sphynx', 'Khác'];

  const loadPet = async () => {
    if (!id) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      const res = await petApi.getPetById(String(id)) as any;
      if (res && res.success) {
        setPet(res.data.pet);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin thú cưng.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error loading pet details:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPet();
  }, [id]);

  const handleSettingsPress = () => {
    Alert.alert(
      'Tùy chọn thú cưng 🐾',
      'Bạn muốn thực hiện thao tác nào với hồ sơ thú cưng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Chỉnh sửa thông tin', 
          onPress: () => openEditModal() 
        },
        { 
          text: 'Xóa hồ sơ', 
          style: 'destructive',
          onPress: () => confirmDeletePet() 
        }
      ]
    );
  };

  const openEditModal = () => {
    if (!pet) return;
    setAvatarUri(null);
    setEditNeutered(pet.is_neutered || false);
    setEditName(pet.name || '');
    setEditSpecies(pet.species || 'DOG');
    
    const speciesStr = pet.species || 'DOG';
    const breedStr = pet.breed || '';
    
    if (speciesStr === 'DOG') {
      if (dogBreeds.includes(breedStr)) {
        setEditSelectedBreed(breedStr);
        setEditCustomBreed('');
      } else {
        setEditSelectedBreed('Khác');
        setEditCustomBreed(breedStr);
      }
    } else if (speciesStr === 'CAT') {
      if (catBreeds.includes(breedStr)) {
        setEditSelectedBreed(breedStr);
        setEditCustomBreed('');
      } else {
        setEditSelectedBreed('Khác');
        setEditCustomBreed(breedStr);
      }
    } else {
      setEditSelectedBreed('Khác');
      setEditCustomBreed(breedStr);
    }

    setEditWeight(pet.weight ? String(pet.weight) : '');
    setEditGender(pet.gender || 'UNKNOWN');

    if (pet.dob) {
      const d = new Date(pet.dob);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      setEditDob(`${day}.${month}.${year}`);
    } else {
      setEditDob('1.1.2026');
    }

    setEditHealthStatus(pet.health_status || 'NORMAL');
    setEditModalVisible(true);
  };

  const handleSpeciesChange = (type: string) => {
    setEditSpecies(type);
    if (type === 'DOG') {
      setEditSelectedBreed('Poodle');
    } else if (type === 'CAT') {
      setEditSelectedBreed('British Shorthair');
    } else {
      setEditSelectedBreed('Khác');
    }
    setEditCustomBreed('');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập bị từ chối', 'Ứng dụng cần quyền truy cập thư viện ảnh để thay đổi ảnh thú cưng.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleUpdatePet = async () => {
    if (!editName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên thú cưng');
      return;
    }

    let finalBreed = '';
    if (editSpecies === 'OTHER') {
      finalBreed = editCustomBreed.trim();
    } else {
      finalBreed = editSelectedBreed === 'Khác' ? editCustomBreed.trim() : editSelectedBreed;
    }

    if (!finalBreed) {
      Alert.alert('Thông báo', 'Vui lòng chọn hoặc nhập giống thú cưng');
      return;
    }

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('species', editSpecies);
      formData.append('breed', finalBreed);
      formData.append('weight', editWeight ? editWeight : '0');
      formData.append('gender', editGender);
      formData.append('is_neutered', String(editNeutered));

      // Clean dob date string (DD.MM.YYYY -> YYYY-MM-DD)
      let cleanDob = editDob.trim();
      if (cleanDob) {
        const parts = cleanDob.split(/[./-]/);
        if (parts.length === 3) {
          if (parts[2].length === 4) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            cleanDob = `${year}-${month}-${day}`;
          }
        }
      }
      formData.append('dob', cleanDob);
      formData.append('health_status', editHealthStatus);

      if (avatarUri) {
        const uriParts = avatarUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('avatar', {
          uri: Platform.OS === 'ios' ? avatarUri.replace('file://', '') : avatarUri,
          name: `pet_avatar.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const res = await petApi.updatePet(String(id), formData) as any;
      setUpdating(false);
      if (res && res.success) {
        Alert.alert('Thành công', 'Cập nhật hồ sơ thú cưng thành công! 🐾');
        setEditModalVisible(false);
        loadPet();
      } else {
        Alert.alert('Thất bại', res.message || 'Không thể cập nhật thông tin.');
      }
    } catch (error: any) {
      setUpdating(false);
      console.error('Error updating pet:', error);
      Alert.alert('Lỗi', error.response?.data?.message || error.message || 'Có lỗi xảy ra.');
    }
  };

  const confirmDeletePet = () => {
    Alert.alert(
      'Xác nhận xóa vĩnh viễn ⚠️',
      `Bạn có chắc muốn xóa hồ sơ thú cưng ${pet?.name}? Hành động này sẽ xóa sạch dữ liệu và nhiệm vụ liên quan.`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa vĩnh viễn', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const res = await petApi.deletePet(String(id)) as any;
              if (res && res.success) {
                Alert.alert('Thành công', 'Đã xóa hồ sơ thú cưng thành công.');
                router.replace('/(tabs)/pets');
              } else {
                Alert.alert('Thất bại', res.message || 'Không thể xóa hồ sơ.');
                setLoading(false);
              }
            } catch (error: any) {
              setLoading(false);
              console.error('Error deleting pet:', error);
              Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi xóa thú cưng.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4B4B" />
      </View>
    );
  }

  const currentLevel = pet?.stats?.level || 1;
  const currentXp = pet?.stats?.xp || 0;
  const xpNeeded = currentLevel * 100 + 800;
  const remainingXp = xpNeeded - currentXp;

  const moodPercent = pet?.stats?.mood !== undefined ? pet.stats.mood : 75;
  const getMoodLabel = (m: number) => {
    if (m >= 80) return 'Very Happy';
    if (m >= 60) return 'Happy';
    if (m >= 40) return 'Neutral';
    return 'Sad';
  };

  const translateSpecies = (s: string) => {
    if (s === 'DOG') return 'Chó';
    if (s === 'CAT') return 'Mèo';
    return 'Khác';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1B2530" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ Pet</Text>
        <TouchableOpacity onPress={handleSettingsPress} style={styles.gearBtn}>
          <Ionicons name="settings-sharp" size={22} color="#1B2530" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pet Avatar and Title */}
        <View style={styles.petHeroSection}>
          <View style={styles.avatarOutlineRing}>
            <View style={styles.avatarImageContainer}>
              {pet?.avatar_url ? (
                <Image source={{ uri: pet.avatar_url }} style={styles.petImage} />
              ) : (
                <View style={styles.pawPlaceholder}>
                  <Ionicons name="paw" size={60} color="#FCD7D7" />
                </View>
              )}
            </View>
          </View>
          <Text style={styles.petName}>{pet?.name || 'Rudy'}</Text>
          <Text style={styles.petBreedSub}>{translateSpecies(pet?.species)} • {pet?.breed}</Text>
          <Text style={styles.xpText}>{remainingXp} XP cho cấp độ tiếp theo</Text>
        </View>

        {/* Mood Meter Card */}
        <View style={styles.moodCard}>
          <View style={styles.moodHeaderRow}>
            <View style={styles.moodLeft}>
              <View style={styles.moodIconWrap}>
                <Ionicons name="happy" size={18} color="#EC4B4B" />
              </View>
              <Text style={styles.moodTitle}>Mood Meter</Text>
            </View>
            <Text style={styles.moodValueText}>{moodPercent}% • {getMoodLabel(moodPercent)}</Text>
          </View>

          {/* Custom Slider track display */}
          <View style={styles.sliderTrackBg}>
            <View style={[styles.sliderTrackFill, { width: `${moodPercent}%` }]} />
          </View>

          <View style={styles.sliderLabelsRow}>
            <Text style={styles.sliderLabelLeft}>Buồn chán</Text>
            <Text style={styles.sliderLabelRight}>Năng lượng</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Thành tựu</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/achievements-list', params: { petId: String(id) } })}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
          <View style={styles.achievementCard}>
            <View style={[styles.achievementIconCircle, { backgroundColor: '#E2FBE9' }]}>
              <Ionicons name="home" size={22} color="#27AE60" />
            </View>
            <Text style={styles.achievementTitle}>New Home</Text>
            <Text style={styles.achievementDesc}>Welcome home, Buddy!</Text>
          </View>

          <View style={styles.achievementCard}>
            <View style={[styles.achievementIconCircle, { backgroundColor: '#E2F5FF' }]}>
              <Ionicons name="walk" size={22} color="#2D9CDB" />
            </View>
            <Text style={styles.achievementTitle}>Explorer</Text>
            <Text style={styles.achievementDesc}>Lần đầu dắt pet đi dạo</Text>
          </View>

          <View style={styles.achievementCard}>
            <View style={[styles.achievementIconCircle, { backgroundColor: '#FFF7E6' }]}>
              <Ionicons name="trophy" size={22} color="#F2994A" />
            </View>
            <Text style={styles.achievementTitle}>Champion</Text>
            <Text style={styles.achievementDesc}>Đạt cấp độ 5</Text>
          </View>
        </ScrollView>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.missionBtn} 
          onPress={() => router.push('/mission-detail')}
          activeOpacity={0.9}
        >
          <Text style={styles.missionBtnText}>Go to Daily Missions</Text>
          <Ionicons name="rocket-sharp" size={18} color="#fff" style={styles.rocketIcon} />
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Pet Modal */}
      <Modal animationType="slide" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalBg}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalKeyboard}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalMainTitle}>Chỉnh sửa thông tin Pet 🐾</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close-circle" size={28} color="#A5B2C0" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                {/* Ảnh Đại Diện Thú Cưng */}
                <View style={styles.avatarSection}>
                  <TouchableOpacity onPress={pickImage} style={styles.avatarCircle}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                    ) : pet?.avatar_url ? (
                      <Image source={{ uri: pet.avatar_url }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <Ionicons name="camera" size={26} color="#ED4D4D" />
                        <Text style={styles.uploadBtnText}>UPLOAD</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.uploadSubtext}>Tải lên ảnh thú cưng mới (tùy chọn)</Text>
                </View>

                {/* Tên Pet */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Tên Pet</Text>
                  <TextInput 
                    style={styles.input} 
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Nhập tên pet..."
                  />
                </View>

                {/* Loài thú cưng */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Loài thú cưng</Text>
                  <View style={styles.typeRow}>
                    {[
                      { label: 'Chó', type: 'DOG' },
                      { label: 'Mèo', type: 'CAT' },
                      { label: 'Khác', type: 'OTHER' }
                    ].map((item) => (
                      <TouchableOpacity 
                        key={item.type}
                        style={[styles.typeBtn, editSpecies === item.type && styles.typeBtnActive]}
                        onPress={() => handleSpeciesChange(item.type)}
                      >
                        <Text style={[styles.typeBtnText, editSpecies === item.type && styles.typeBtnTextActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Giống thú cưng */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Giống thú cưng</Text>
                  {editSpecies !== 'OTHER' ? (
                    <View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                        {(editSpecies === 'DOG' ? dogBreeds : catBreeds).map((b) => (
                          <TouchableOpacity
                            key={b}
                            style={[styles.breedChip, editSelectedBreed === b && styles.activeBreedChip]}
                            onPress={() => {
                              setEditSelectedBreed(b);
                              if (b !== 'Khác') setEditCustomBreed('');
                            }}
                          >
                            <Text style={[styles.breedChipText, editSelectedBreed === b && styles.activeBreedChipText]}>
                              {b}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      {editSelectedBreed === 'Khác' && (
                        <TextInput 
                          style={[styles.input, { marginTop: 10 }]} 
                          value={editCustomBreed}
                          onChangeText={setEditCustomBreed}
                          placeholder="Nhập giống khác..."
                        />
                      )}
                    </View>
                  ) : (
                    <TextInput 
                      style={styles.input} 
                      value={editCustomBreed}
                      onChangeText={setEditCustomBreed}
                      placeholder="Ví dụ: Vẹt, Hamster..."
                    />
                  )}
                </View>

                {/* Cân nặng & Giới tính */}
                <View style={styles.rowForm}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                    <Text style={styles.label}>Cân nặng (kg)</Text>
                    <TextInput 
                      style={styles.input} 
                      value={editWeight}
                      onChangeText={setEditWeight}
                      keyboardType="numeric"
                      placeholder="5.0"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1.2 }]}>
                    <Text style={styles.label}>Giới tính</Text>
                    <View style={styles.genderContainer}>
                      <TouchableOpacity 
                        style={[styles.genderSegment, editGender === 'MALE' && styles.activeGenderSegment]}
                        onPress={() => setEditGender('MALE')}
                      >
                        <Text style={editGender === 'MALE' ? styles.activeGenderText : styles.genderText}>Đực</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.genderSegment, editGender === 'FEMALE' && styles.activeGenderSegment]}
                        onPress={() => setEditGender('FEMALE')}
                      >
                        <Text style={editGender === 'FEMALE' ? styles.activeGenderText : styles.genderText}>Cái</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Tình trạng triệt sản */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Tình trạng triệt sản</Text>
                  <View style={styles.genderContainer}>
                    <TouchableOpacity 
                      style={[styles.genderSegment, !editNeutered && styles.activeGenderSegment]}
                      onPress={() => setEditNeutered(false)}
                    >
                      <Text style={!editNeutered ? styles.activeGenderText : styles.genderText}>Chưa triệt sản</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.genderSegment, editNeutered && styles.activeGenderSegment]}
                      onPress={() => setEditNeutered(true)}
                    >
                      <Text style={editNeutered ? styles.activeGenderText : styles.genderText}>Đã triệt sản</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Ngày sinh */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Ngày Sinh</Text>
                  <TextInput 
                    style={styles.input} 
                    value={editDob}
                    onChangeText={setEditDob}
                    placeholder="DD.MM.YYYY"
                  />
                </View>

                {/* Tình trạng sức khỏe */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Tình trạng sức khỏe</Text>
                  <View style={styles.healthOptionsScroll}>
                    {[
                      { key: 'NORMAL', label: 'Khỏe mạnh', desc: 'Kiểm tra đầy đủ', color: '#EC4B4B', bg: '#FFF0F0', icon: 'happy' },
                      { key: 'OVERWEIGHT', label: 'Thừa cân (Overweight)', desc: 'Cần giảm calo', color: '#EC4B4B', bg: '#FFF0F0', icon: 'trending-up' },
                      { key: 'UNDERWEIGHT', label: 'Thiếu cân (Underweight)', desc: 'Cần bồi bổ', color: '#FFA500', bg: '#FFF6E9', icon: 'trending-down' },
                      { key: 'SICK', label: 'Yêu cầu chăm sóc (Ốm)', desc: 'Cần theo dõi', color: '#FFA500', bg: '#FFF6E9', icon: 'alert-circle' },
                      { key: 'POST_SURGERY', label: 'Điều trị y tế (Sau phẫu thuật)', desc: 'Hỗ trợ liên tục', color: '#EC4B4B', bg: '#FFF0F0', icon: 'medical-sharp' }
                    ].map((status) => (
                      <TouchableOpacity
                        key={status.key}
                        style={[styles.modalHealthItem, editHealthStatus === status.key && styles.modalHealthItemActive]}
                        onPress={() => setEditHealthStatus(status.key)}
                      >
                        <View style={[styles.iconCircleWrap, { backgroundColor: status.bg }]}>
                          <Ionicons name={status.icon as any} size={18} color={status.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.modalHealthTitle, editHealthStatus === status.key && styles.activeHealthTitle]}>
                            {status.label}
                          </Text>
                          <Text style={styles.modalHealthDesc}>{status.desc}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Nút lưu */}
                <TouchableOpacity 
                  style={[styles.saveBtn, updating && { opacity: 0.7 }]} 
                  onPress={handleUpdatePet}
                  disabled={updating}
                >
                  {updating ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
                </TouchableOpacity>

              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B2530' },
  gearBtn: { padding: 4 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF9F9' },
  
  petHeroSection: { alignItems: 'center', marginVertical: 16 },
  avatarOutlineRing: { width: 154, height: 154, borderRadius: 77, borderWidth: 1, borderColor: '#FFEBEB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8 },
  avatarImageContainer: { width: 140, height: 140, borderRadius: 70, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  petImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  pawPlaceholder: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center' },
  petName: { fontSize: 24, fontWeight: 'bold', color: '#1B2530', marginTop: 12, marginBottom: 2 },
  petBreedSub: { fontSize: 14, color: '#8A9AA9', fontWeight: '600', marginBottom: 6 },
  xpText: { fontSize: 13, color: '#EC4B4B', fontWeight: 'bold', letterSpacing: 0.2 },

  moodCard: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#FFEBEB', padding: 20, marginVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.01, shadowRadius: 4 },
  moodHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  moodLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  moodIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center' },
  moodTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B2530' },
  moodValueText: { fontSize: 14, fontWeight: 'bold', color: '#EC4B4B' },
  sliderTrackBg: { height: 10, backgroundColor: '#FFF0F0', borderRadius: 5, overflow: 'hidden' },
  sliderTrackFill: { height: '100%', backgroundColor: '#EC4B4B', borderRadius: 5 },
  sliderLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sliderLabelLeft: { fontSize: 12, color: '#A5B2C0', fontWeight: 'bold' },
  sliderLabelRight: { fontSize: 12, color: '#A5B2C0', fontWeight: 'bold' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1B2530' },
  viewAllText: { fontSize: 13, fontWeight: 'bold', color: '#8A9AA9' },

  achievementsScroll: { gap: 12, paddingBottom: 4 },
  achievementCard: { width: 120, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#FFEBEB', padding: 16, alignItems: 'center' },
  achievementIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  achievementTitle: { fontSize: 13, fontWeight: 'bold', color: '#1B2530', marginBottom: 4 },
  achievementDesc: { fontSize: 10, color: '#8A9AA9', fontWeight: '600', textAlign: 'center', lineHeight: 14 },

  missionBtn: { flexDirection: 'row', backgroundColor: '#EC4B4B', borderRadius: 28, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, shadowColor: '#EC4B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  missionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rocketIcon: { marginLeft: 2 },

  // Edit Modal Styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingVertical: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#FFEBEB' },
  modalMainTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B2530' },
  modalScroll: { paddingVertical: 20, paddingBottom: 40 },
  
  formGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#1B2530', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#FFEBEB', paddingHorizontal: 20, paddingVertical: 12, fontSize: 14, color: '#1B2530' },
  
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#FFEBEB', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#EC4B4B', borderColor: '#EC4B4B' },
  typeBtnText: { fontSize: 13, color: '#8A9AA9', fontWeight: 'bold' },
  typeBtnTextActive: { color: '#fff' },

  breedChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#FFEBEB', marginRight: 8, justifyContent: 'center' },
  activeBreedChip: { backgroundColor: '#EC4B4B', borderColor: '#EC4B4B' },
  breedChipText: { fontSize: 13, color: '#8A9AA9', fontWeight: '600' },
  activeBreedChipText: { color: '#fff', fontWeight: 'bold' },

  rowForm: { flexDirection: 'row', alignItems: 'center' },
  genderContainer: { flexDirection: 'row', backgroundColor: '#FFF0F0', borderRadius: 24, padding: 4, height: 46, alignItems: 'center', borderWidth: 1, borderColor: '#FFEBEB' },
  genderSegment: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  activeGenderSegment: { backgroundColor: '#EC4B4B' },
  genderText: { fontSize: 13, color: '#8A9AA9', fontWeight: '600' },
  activeGenderText: { fontSize: 13, color: '#fff', fontWeight: 'bold' },

  healthOptionsScroll: { gap: 10, marginTop: 4 },
  modalHealthItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#FFEBEB', backgroundColor: '#fff' },
  modalHealthItemActive: { borderColor: '#EC4B4B', backgroundColor: '#FFFDFD' },
  iconCircleWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  modalHealthTitle: { fontSize: 14, fontWeight: 'bold', color: '#1B2530', marginBottom: 2 },
  activeHealthTitle: { color: '#EC4B4B' },
  activeHealthTitleOrange: { color: '#FFA500' },
  modalHealthDesc: { fontSize: 11, color: '#8A9AA9', fontWeight: '500' },
  healthDivider: { height: 1, backgroundColor: '#FFEBEB', marginVertical: 8 },

  saveBtn: { backgroundColor: '#EC4B4B', borderRadius: 28, paddingVertical: 14, alignItems: 'center', marginTop: 16, shadowColor: '#EC4B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFFDFD', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#FFC8C8', overflow: 'hidden' },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  uploadBtnText: { color: '#ED4D4D', fontSize: 10, fontWeight: 'bold', marginTop: 4, letterSpacing: 0.5 },
  uploadSubtext: { fontSize: 12, color: '#8A9AA9', fontWeight: '500' },
});
