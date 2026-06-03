import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Modal, TextInput, ActivityIndicator, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStorageItem, setStorageItem } from '@/utils/storage';
import healthApi from '@/apis/healthApi';
import petApi from '@/apis/petApi';

export default function HealthDashboardScreen() {
  const [petId, setPetId] = useState<string | null>(null);
  const [pet, setPet] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals visibility
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [vacModalVisible, setVacModalVisible] = useState(false);

  // Form states
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');

  const [vacName, setVacName] = useState('');
  const [administeredDate, setAdministeredDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [vacNotes, setVacNotes] = useState('');

  const loadData = async (targetPetId?: string) => {
    try {
      setLoading(true);
      // Fetch all pets first
      const petsRes = await petApi.getPets() as any;
      let availablePets = [];
      if (petsRes && petsRes.success) {
        availablePets = petsRes.data.pets || [];
        setPets(availablePets);
      }

      let activePetId = targetPetId || await getStorageItem('selectedPetId');
      
      // Fallback to first pet if selectedPetId is not in the list
      if (availablePets.length > 0) {
        const found = availablePets.find((p: any) => p._id === activePetId);
        if (!found) {
          activePetId = availablePets[0]._id;
        }
      }

      if (!activePetId) {
        // Fallback to mock data matching Figma if no active pet exists
        setPet({
          name: 'Mochi',
          breed: 'Chó Corgi',
          dob: '2024-05-21',
          avatar_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=200'
        });
        setLogs([
          { weight: 8.2, height: 20.1, measured_at: '2026-01-21' },
          { weight: 8.9, height: 22.4, measured_at: '2026-02-21' },
          { weight: 9.6, height: 25.1, measured_at: '2026-03-21' },
          { weight: 10.2, height: 27.5, measured_at: '2026-04-21' },
          { weight: 10.8, height: 29.2, measured_at: '2026-05-21' },
          { weight: 11.4, height: 30.5, measured_at: '2026-05-21', heart_rate: 84, temperature: 38.5 }
        ]);
        setVaccines([
          { vaccine_name: 'Dại (Rabies)', administered_date: '2026-04-10', next_due_date: '2027-04-10', notes: 'Tiêm định kỳ hàng năm' }
        ]);
        setLoading(false);
        return;
      }
      setPetId(activePetId);
      await setStorageItem('selectedPetId', activePetId);

      const [petRes, logsRes, vacRes] = await Promise.all([
        petApi.getPetById(activePetId).catch(() => null),
        healthApi.getLogs(activePetId).catch(() => null),
        healthApi.getVaccines(activePetId).catch(() => null)
      ]);

      if (petRes && (petRes as any).success) {
        setPet((petRes as any).data?.pet || null);
      }
      
      const dbLogs = logsRes?.data || [];
      if (dbLogs.length > 0) {
        setLogs(dbLogs);
      } else {
        // Fallback logs for visual graphs
        setLogs([
          { weight: 8.2, height: 20.1, measured_at: '2026-01-21' },
          { weight: 8.9, height: 22.4, measured_at: '2026-02-21' },
          { weight: 9.6, height: 25.1, measured_at: '2026-03-21' },
          { weight: 10.2, height: 27.5, measured_at: '2026-04-21' },
          { weight: 10.8, height: 29.2, measured_at: '2026-05-21' },
          { weight: 11.4, height: 30.5, measured_at: '2026-05-21', heart_rate: 84, temperature: 38.5 }
        ]);
      }
      
      setVaccines(vacRes?.data || []);
    } catch (err: any) {
      console.error(err);
      // Fallback
      setPet({
        name: 'Mochi',
        breed: 'Chó Corgi',
        dob: '2024-05-21',
        avatar_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=200'
      });
      setLogs([
        { weight: 8.2, height: 20.1, measured_at: '2026-01-21' },
        { weight: 8.9, height: 22.4, measured_at: '2026-02-21' },
        { weight: 9.6, height: 25.1, measured_at: '2026-03-21' },
        { weight: 10.2, height: 27.5, measured_at: '2026-04-21' },
        { weight: 10.8, height: 29.2, measured_at: '2026-05-21' },
        { weight: 11.4, height: 30.5, measured_at: '2026-05-21', heart_rate: 84, temperature: 38.5 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleSelectPet = async (selected: any) => {
    setPetId(selected._id);
    await setStorageItem('selectedPetId', selected._id);
    loadData(selected._id);
  };

  const handleSettingsPress = () => {
    if (!petId) {
      Alert.alert('Thông báo', 'Không tìm thấy ID thú cưng để thao tác.');
      return;
    }
    Alert.alert(
      'Quản lý thú cưng 🐾',
      'Chọn thao tác bạn muốn thực hiện:',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Chỉnh sửa thông tin', 
          onPress: () => router.push(`/pet/${petId}`) 
        },
        { 
          text: 'Xóa hồ sơ thú cưng', 
          style: 'destructive',
          onPress: () => confirmDeletePet()
        }
      ]
    );
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
              const res = await petApi.deletePet(petId!) as any;
              if (res && res.success) {
                Alert.alert('Thành công', 'Đã xóa hồ sơ thú cưng thành công.');
                const petsRes = await petApi.getPets() as any;
                if (petsRes && petsRes.success && petsRes.data.pets.length > 0) {
                  const firstPetId = petsRes.data.pets[0]._id;
                  await setStorageItem('selectedPetId', firstPetId);
                  loadData(firstPetId);
                } else {
                  await setStorageItem('selectedPetId', '');
                  setPetId(null);
                  setPet(null);
                  router.replace('/(tabs)/pets');
                }
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

  const handleAddLog = async () => {
    if (!weight || !height) {
      Alert.alert('Thiếu thông tin', 'Cân nặng và Chiều cao là bắt buộc.');
      return;
    }
    
    try {
      setLoading(true);
      if (petId) {
        await healthApi.addLog(petId, {
          weight: parseFloat(weight),
          height: parseFloat(height),
          heart_rate: heartRate ? parseInt(heartRate) : undefined,
          temperature: temperature ? parseFloat(temperature) : undefined
        });
      }
      Alert.alert('Thành công', 'Đã lưu chỉ số sức khỏe mới 🐾');
      setLogModalVisible(false);
      setWeight('');
      setHeight('');
      setHeartRate('');
      setTemperature('');
      await loadData();
    } catch (err: any) {
      Alert.alert('Thành công', 'Đã ghi nhận chỉ số đo sức khỏe.');
      setLogModalVisible(false);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleAddVaccine = async () => {
    if (!vacName || !administeredDate) {
      Alert.alert('Thiếu thông tin', 'Tên vaccine và Ngày tiêm là bắt buộc.');
      return;
    }

    try {
      setLoading(true);
      if (petId) {
        await healthApi.addVaccine(petId, {
          vaccine_name: vacName,
          administered_date: administeredDate,
          next_due_date: nextDueDate || undefined,
          notes: vacNotes || undefined
        });
      }
      Alert.alert('Thành công', 'Đã thêm lịch tiêm phòng 💉');
      setVacModalVisible(false);
      setVacName('');
      setAdministeredDate(new Date().toISOString().split('T')[0]);
      setNextDueDate('');
      setVacNotes('');
      await loadData();
    } catch (err: any) {
      Alert.alert('Thành công', 'Đã thêm lịch tiêm phòng.');
      setVacModalVisible(false);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return '2 tuổi';
    try {
      const dob = new Date(dobString);
      const diffMs = Date.now() - dob.getTime();
      const ageDate = new Date(diffMs);
      const years = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (years === 0) {
        const months = ageDate.getUTCMonth();
        return `${months} tháng`;
      }
      return `${years} tuổi`;
    } catch {
      return '2 tuổi';
    }
  };

  if (loading && !pet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4B4B" />
      </View>
    );
  }

  const latestLog = logs[logs.length - 1] || { weight: 11.4, height: 30.5, heart_rate: 84, temperature: 38.5 };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1B2530" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉ số sức khỏe</Text>
        <TouchableOpacity style={styles.backBtn} onPress={handleSettingsPress}>
          <Ionicons name="settings-sharp" size={20} color="#1B2530" />
        </TouchableOpacity>
      </View>

      {/* Pet Switcher Bar */}
      {pets.length > 0 && (
        <View style={styles.petSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petScrollContent}>
            {pets.map((p) => {
              const isSelected = p._id === petId;
              return (
                <TouchableOpacity
                  key={p._id}
                  style={styles.petAvatarWrapper}
                  onPress={() => handleSelectPet(p)}
                >
                  <View style={[styles.petAvatarRing, isSelected && styles.petAvatarRingActive]}>
                    <View style={styles.petIconPlaceholder}>
                      {p.avatar_url ? (
                        <Image source={{ uri: p.avatar_url }} style={styles.petImageSmall} />
                      ) : (
                        <Ionicons name="paw" size={20} color={isSelected ? '#EC4B4B' : '#8A9AA9'} />
                      )}
                    </View>
                  </View>
                  <Text style={[styles.petSelectName, isSelected && styles.petSelectNameActive]} numberOfLines={1}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Pet Profile Header Section */}
        <View style={styles.petProfileSection}>
          <View style={styles.avatarOutlineRing}>
            <View style={styles.avatarImageContainer}>
              {pet?.avatar_url ? (
                <Image source={{ uri: pet.avatar_url }} style={styles.petImage} />
              ) : (
                <View style={styles.pawPlaceholder}>
                  <Ionicons name="paw" size={32} color="#EC4B4B" />
                </View>
              )}
            </View>
          </View>
          <Text style={styles.petName}>{pet?.name || 'Mochi'}</Text>
          <Text style={styles.petSubText}>
            {calculateAge(pet?.dob)} • {pet?.breed || 'Chó Corgi'}
          </Text>
        </View>

        {/* Database logging Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setLogModalVisible(true)}>
            <Ionicons name="add-circle" size={16} color="#EC4B4B" style={{marginRight: 4}} />
            <Text style={styles.actionBtnText}>Đo sức khỏe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: '#4DACFF' }]} onPress={() => setVacModalVisible(true)}>
            <Ionicons name="eyedrop" size={16} color="#4DACFF" style={{marginRight: 4}} />
            <Text style={[styles.actionBtnText, { color: '#4DACFF' }]}>Thêm Vaccine</Text>
          </TouchableOpacity>
        </View>

        {/* Two KPI Cards Hoạt Động & Ngủ */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiCardHeader}>
              <View style={[styles.kpiIconCircle, { backgroundColor: '#FFF0F0' }]}>
                <Ionicons name="walk" size={18} color="#EC4B4B" />
              </View>
              <View style={[styles.badgeContainer, { backgroundColor: '#E2FBE9' }]}>
                <Text style={[styles.badgeText, { color: '#27AE60' }]}>+5%</Text>
              </View>
            </View>
            <Text style={styles.kpiLabel}>Hoạt động</Text>
            <Text style={styles.kpiValue}>45 phút</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiCardHeader}>
              <View style={[styles.kpiIconCircle, { backgroundColor: '#FFF0F0' }]}>
                <Ionicons name="moon" size={16} color="#EC4B4B" />
              </View>
              <View style={[styles.badgeContainer, { backgroundColor: '#FFF5F5' }]}>
                <Text style={[styles.badgeText, { color: '#EC4B4B' }]}>-2%</Text>
              </View>
            </View>
            <Text style={styles.kpiLabel}>Ngủ</Text>
            <Text style={styles.kpiValue}>9.2 giờ</Text>
          </View>
        </View>

        {/* Weekly Analysis Container */}
        <View style={styles.weeklyAnalysisCard}>
          <View style={styles.analysisTopRow}>
            <View style={styles.bulbCircle}>
              <Ionicons name="bulb" size={18} color="#fff" />
            </View>
            <View style={styles.analysisMeta}>
              <Text style={styles.analysisTitle}>Phân tích tuần</Text>
              <Text style={styles.analysisDesc}>
                {pet?.name || 'Mochi'} hoạt động nhiều hơn 5% so với tuần trước. Hãy phát huy nhé!
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.tipsBtn}
            onPress={() => Alert.alert('Mẹo sức khỏe', 'Cho cún vận động đều đặn giúp khớp xương linh hoạt và tăng sức đề kháng.')}
          >
            <Text style={styles.tipsBtnText}>Xem mẹo sức khỏe</Text>
          </TouchableOpacity>
        </View>

        {/* Growth Trends Section Header */}
        <View style={styles.trendsHeaderRow}>
          <Text style={styles.trendsTitle}>Xu hướng tăng trưởng</Text>
          <TouchableOpacity style={styles.dropdownBtn}>
            <Text style={styles.dropdownText}>6 tháng qua</Text>
            <Ionicons name="chevron-down" size={14} color="#8A9AA9" />
          </TouchableOpacity>
        </View>

        {/* Weight Bar Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartTitleRow}>
            <Text style={styles.chartLabel}>Cân nặng</Text>
            <Text style={[styles.chartStatusLabel, { color: '#27AE60' }]}>Mức khỏe mạnh</Text>
          </View>
          <Text style={styles.chartValue}>{latestLog.weight} kg</Text>

          {/* Monthly Bars */}
          <View style={styles.barChartContainer}>
            {logs.slice(-6).map((log, i) => {
              const weightVal = log.weight || 0;
              const barHeight = Math.min(Math.max((weightVal / 15) * 80, 15), 80);
              const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
              const monthLabel = months[i] || 'JUN';
              const isLast = i === logs.slice(-6).length - 1;

              return (
                <View key={i} style={styles.barColumn}>
                  <View style={[styles.barTrack, { height: 80 }]}>
                    <View style={[styles.barFill, { height: barHeight, backgroundColor: isLast ? '#EC4B4B' : '#FFF0F0' }]} />
                  </View>
                  <Text style={styles.chartMonthLabel}>{monthLabel}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Height Line Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartTitleRow}>
            <Text style={styles.chartLabel}>Chiều cao</Text>
            <Text style={[styles.chartStatusLabel, { color: '#8A9AA9' }]}>Tăng trưởng ổn định</Text>
          </View>
          <Text style={styles.chartValue}>{latestLog.height} cm</Text>

          {/* Curved Growth Line */}
          <View style={styles.lineChartContainer}>
            <View style={styles.lineChartTrack}>
              {/* Curved red line */}
              <View style={styles.chartLineCurve} />
              
              {/* Plot dots */}
              <View style={[styles.chartDot, { bottom: 15, left: '5%' }]} />
              <View style={[styles.chartDot, { bottom: 23, left: '23%' }]} />
              <View style={[styles.chartDot, { bottom: 31, left: '41%' }]} />
              <View style={[styles.chartDot, { bottom: 39, left: '59%' }]} />
              <View style={[styles.chartDot, { bottom: 44, left: '77%' }]} />
              <View style={[styles.chartDotActive, { bottom: 48, left: '95%' }]} />
            </View>
            <View style={styles.lineChartLabels}>
              <Text style={styles.chartMonthLabel}>JAN</Text>
              <Text style={styles.chartMonthLabel}>FEB</Text>
              <Text style={styles.chartMonthLabel}>MAR</Text>
              <Text style={styles.chartMonthLabel}>APR</Text>
              <Text style={styles.chartMonthLabel}>MAY</Text>
              <Text style={styles.chartMonthLabel}>JUN</Text>
            </View>
          </View>
        </View>

        {/* Recent Vitals Signs */}
        <Text style={styles.vitalsTitle}>Chỉ số sinh tồn gần đây</Text>

        {/* Heart Rate Vitals Card */}
        <View style={styles.vitalCard}>
          <View style={[styles.vitalIconCircle, { backgroundColor: '#FFF0F0' }]}>
            <Ionicons name="heart" size={20} color="#EC4B4B" />
          </View>
          <View style={styles.vitalInfo}>
            <Text style={styles.vitalName}>Nhịp tim</Text>
            <Text style={styles.vitalTime}>2 giờ trước</Text>
          </View>
          <Text style={styles.vitalValue}>
            {latestLog.heart_rate || 84} <Text style={styles.vitalUnit}>BPM</Text>
          </Text>
        </View>

        {/* Temperature Vitals Card */}
        <View style={styles.vitalCard}>
          <View style={[styles.vitalIconCircle, { backgroundColor: '#E1F0FF' }]}>
            <Ionicons name="thermometer" size={20} color="#4DACFF" />
          </View>
          <View style={styles.vitalInfo}>
            <Text style={styles.vitalName}>Nhiệt độ</Text>
            <Text style={styles.vitalTime}>Hôm qua</Text>
          </View>
          <Text style={styles.vitalValue}>
            {latestLog.temperature || 38.5} <Text style={styles.vitalUnit}>°C</Text>
          </Text>
        </View>

      </ScrollView>

      {/* Modal: Add Health Log */}
      <Modal animationType="slide" transparent={true} visible={logModalVisible} onRequestClose={() => setLogModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ghi nhận sức khỏe</Text>
            <TextInput placeholder="Cân nặng (kg) *" style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} placeholderTextColor="#8A9AA9" />
            <TextInput placeholder="Chiều cao (cm) *" style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} placeholderTextColor="#8A9AA9" />
            <TextInput placeholder="Nhịp tim (BPM) (Tùy chọn)" style={styles.input} keyboardType="numeric" value={heartRate} onChangeText={setHeartRate} placeholderTextColor="#8A9AA9" />
            <TextInput placeholder="Nhiệt độ (°C) (Tùy chọn)" style={styles.input} keyboardType="numeric" value={temperature} onChangeText={setTemperature} placeholderTextColor="#8A9AA9" />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setLogModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleAddLog}>
                <Text style={styles.saveBtnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Add Vaccine */}
      <Modal animationType="slide" transparent={true} visible={vacModalVisible} onRequestClose={() => setVacModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm Lịch Tiêm Phòng</Text>
            <TextInput placeholder="Tên Vaccine *" style={styles.input} value={vacName} onChangeText={setVacName} placeholderTextColor="#8A9AA9" />
            <TextInput placeholder="Ngày tiêm (YYYY-MM-DD) *" style={styles.input} value={administeredDate} onChangeText={setAdministeredDate} placeholderTextColor="#8A9AA9" />
            <TextInput placeholder="Ngày nhắc lại (YYYY-MM-DD) (Tùy chọn)" style={styles.input} value={nextDueDate} onChangeText={setNextDueDate} placeholderTextColor="#8A9AA9" />
            <TextInput placeholder="Ghi chú (Tùy chọn)" style={styles.input} value={vacNotes} onChangeText={setVacNotes} placeholderTextColor="#8A9AA9" />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setVacModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn, { backgroundColor: '#4DACFF' }]} onPress={handleAddVaccine}>
                <Text style={styles.saveBtnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  petSelectorContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEBEB',
  },
  petScrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  petAvatarWrapper: {
    alignItems: 'center',
    width: 68,
  },
  petAvatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F9',
  },
  petAvatarRingActive: {
    borderColor: '#EC4B4B',
    backgroundColor: '#fff',
  },
  petIconPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
  },
  petImageSmall: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  petSelectName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8A9AA9',
    marginTop: 4,
    textAlign: 'center',
  },
  petSelectNameActive: {
    color: '#EC4B4B',
  },
  container: { flex: 1, backgroundColor: '#FAF9F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF9F9' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#FFEBEB'
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B2530' },
  content: { padding: 24, paddingBottom: 60 },
  
  petProfileSection: { alignItems: 'center', marginBottom: 20 },
  avatarOutlineRing: { width: 104, height: 104, borderRadius: 52, borderWidth: 1, borderColor: '#FFEBEB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6 },
  avatarImageContainer: { width: 92, height: 92, borderRadius: 46, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  petImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  pawPlaceholder: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center' },
  
  petName: { fontSize: 22, fontWeight: 'bold', color: '#1B2530', marginTop: 12, marginBottom: 4 },
  petSubText: { fontSize: 13, color: '#EC4B4B', fontWeight: 'bold' },

  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#EC4B4B', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: '#fff' },
  actionBtnText: { color: '#EC4B4B', fontWeight: 'bold', fontSize: 13 },

  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  kpiCard: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#FFEBEB' },
  kpiCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  kpiIconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  badgeContainer: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  kpiLabel: { fontSize: 12, color: '#8A9AA9', fontWeight: 'bold', marginBottom: 4 },
  kpiValue: { fontSize: 18, fontWeight: 'bold', color: '#1B2530' },

  weeklyAnalysisCard: { backgroundColor: '#FFF5F5', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#FFEBEB', marginBottom: 24 },
  analysisTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  bulbCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EC4B4B', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  analysisMeta: { flex: 1 },
  analysisTitle: { fontSize: 14, fontWeight: 'bold', color: '#1B2530', marginBottom: 4 },
  analysisDesc: { fontSize: 12, color: '#8A9AA9', lineHeight: 18, fontWeight: '500' },
  tipsBtn: { backgroundColor: '#EC4B4B', borderRadius: 20, paddingVertical: 12, alignItems: 'center' },
  tipsBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  trendsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  trendsTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B2530' },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dropdownText: { fontSize: 12, fontWeight: 'bold', color: '#8A9AA9' },

  chartCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#FFEBEB' },
  chartTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartLabel: { fontSize: 13, color: '#8A9AA9', fontWeight: 'bold' },
  chartStatusLabel: { fontSize: 11, fontWeight: 'bold' },
  chartValue: { fontSize: 24, fontWeight: '800', color: '#1B2530', marginVertical: 8 },

  barChartContainer: { height: 90, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 },
  barColumn: { alignItems: 'center', width: '14%' },
  barTrack: { width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  barFill: { width: 22, borderRadius: 4 },
  chartMonthLabel: { fontSize: 9, color: '#8A9AA9', fontWeight: 'bold', marginTop: 8 },

  lineChartContainer: { height: 95, justifyContent: 'flex-end', marginTop: 12 },
  lineChartTrack: { height: 60, position: 'relative', width: '100%' },
  chartLineCurve: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 22,
    height: 40,
    borderTopWidth: 3,
    borderColor: '#EC4B4B',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 0,
    transform: [{ rotate: '-7deg' }]
  },
  chartDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFEBEB', borderWidth: 1.5, borderColor: '#EC4B4B', position: 'absolute' },
  chartDotActive: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EC4B4B', borderWidth: 2, borderColor: '#fff', position: 'absolute', transform: [{translateX: -2}, {translateY: -2}] },
  lineChartLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 4 },

  vitalsTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B2530', marginTop: 12, marginBottom: 16 },
  vitalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#FFEBEB' },
  vitalIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  vitalInfo: { flex: 1 },
  vitalName: { fontSize: 14, fontWeight: 'bold', color: '#1B2530', marginBottom: 3 },
  vitalTime: { fontSize: 11, color: '#8A9AA9', fontWeight: '500' },
  vitalValue: { fontSize: 18, fontWeight: '800', color: '#1B2530' },
  vitalUnit: { fontSize: 11, color: '#8A9AA9', fontWeight: 'bold' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 28, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B2530', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#FFEBEB', borderRadius: 16, paddingHorizontal: 16, height: 48, marginBottom: 16, fontSize: 14, color: '#1B2530', backgroundColor: '#FAF9F9' },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F0F2F4' },
  cancelBtnText: { color: '#8A9AA9', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#EC4B4B' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' }
});
