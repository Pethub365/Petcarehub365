import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function PetSetup1Screen() {
  const [name, setName] = useState('');
  const [petType, setPetType] = useState('Chó'); // Chó | Mèo | Khác
  const [selectedBreed, setSelectedBreed] = useState('Poodle');
  const [customBreed, setCustomBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('MALE');
  const [dob, setDob] = useState('1.1.2026');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const dogBreeds = ['Poodle', 'Golden Retriever', 'Corgi', 'Husky', 'Chihuahua', 'Khác'];
  const catBreeds = ['British Shorthair', 'British Longhair', 'Persian', 'Scottish Fold', 'Sphynx', 'Khác'];

  // Cập nhật giống mặc định khi đổi loài
  const handlePetTypeChange = (type: string) => {
    setPetType(type);
    if (type === 'Chó') {
      setSelectedBreed('Poodle');
    } else if (type === 'Mèo') {
      setSelectedBreed('British Shorthair');
    } else {
      setSelectedBreed('Khác');
    }
    setCustomBreed('');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập bị từ chối', 'Ứng dụng cần quyền truy cập thư viện ảnh để tải lên ảnh thú cưng.');
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

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên thú cưng');
      return;
    }

    let finalBreed = '';
    if (petType === 'Khác') {
      finalBreed = customBreed.trim();
    } else {
      finalBreed = selectedBreed === 'Khác' ? customBreed.trim() : selectedBreed;
    }

    if (!finalBreed) {
      Alert.alert('Thông báo', 'Vui lòng chọn hoặc nhập giống thú cưng');
      return;
    }

    router.push({
      pathname: '/(setup)/pet-setup-2',
      params: {
        name: name.trim(),
        species: petType === 'Chó' ? 'DOG' : petType === 'Mèo' ? 'CAT' : 'OTHER',
        breed: finalBreed,
        weight: weight ? weight : '0',
        gender,
        dob,
        avatarUri: avatarUri || ''
      }
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#1A2530" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pet</Text>
            <View style={{ width: 24 }} />
        </View>

        <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.activeDot]} />
            <View style={[styles.progressDot, styles.inactiveDot]} />
        </View>
        <Text style={styles.stepText}>Step 1 of 2</Text>

        <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarCircle}>
                {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.uploadPlaceholder}>
                        <Ionicons name="camera" size={30} color="#ED4D4D" />
                        <Text style={styles.uploadBtnText}>UPLOAD</Text>
                    </View>
                )}
            </TouchableOpacity>
            <Text style={styles.uploadSubtext}>Tải lên ảnh thú cưng của bạn</Text>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Tên Pet</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Ex: Rudy" 
                placeholderTextColor="#A5B2C0"
                value={name}
                onChangeText={setName}
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Loài thú cưng</Text>
            <View style={styles.typeRow}>
                {[
                  { label: 'Chó', type: 'Chó' },
                  { label: 'Mèo', type: 'Mèo' },
                  { label: 'Khác', type: 'Khác' }
                ].map((item) => (
                    <View key={item.type} style={styles.typeCol}>
                      <TouchableOpacity 
                          style={[styles.typeBtnCircle, petType === item.type && styles.activeTypeBtnCircle]}
                          onPress={() => handlePetTypeChange(item.type)}
                      >
                          <Ionicons 
                            name="paw" 
                            size={24} 
                            color={petType === item.type ? '#EC4B4B' : '#8A9AA9'} 
                          />
                      </TouchableOpacity>
                      <Text style={[styles.typeTextBelow, petType === item.type && styles.activeTypeTextBelow]}>
                        {item.label}
                      </Text>
                    </View>
                ))}
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Giống thú cưng</Text>
            {petType !== 'Khác' ? (
                <View>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.breedScroll}
                    >
                        {(petType === 'Chó' ? dogBreeds : catBreeds).map((b) => (
                            <TouchableOpacity
                                key={b}
                                style={[
                                    styles.breedChip,
                                    selectedBreed === b && styles.activeBreedChip
                                ]}
                                onPress={() => {
                                    setSelectedBreed(b);
                                    if (b !== 'Khác') setCustomBreed('');
                                }}
                            >
                                <Text style={[
                                    styles.breedChipText,
                                    selectedBreed === b && styles.activeBreedChipText
                                ]}>
                                    {b}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    
                    {selectedBreed === 'Khác' && (
                        <TextInput 
                            style={[styles.input, { marginTop: 12 }]} 
                            placeholder="Nhập giống thú cưng của bạn..." 
                            placeholderTextColor="#A5B2C0"
                            value={customBreed}
                            onChangeText={setCustomBreed}
                        />
                    )}
                </View>
            ) : (
                <TextInput 
                    style={styles.input} 
                    placeholder="Ex: Vẹt đuôi dài, Chuột Hamster..." 
                    placeholderTextColor="#A5B2C0"
                    value={customBreed}
                    onChangeText={setCustomBreed}
                />
            )}
        </View>

        <View style={styles.rowForm}>
            <View style={[styles.formGroup, { flex: 1.2, marginRight: 16 }]}>
                <Text style={styles.label}>Cân nặng (kg)</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="5.0" 
                    placeholderTextColor="#A5B2C0"
                    keyboardType="numeric" 
                    value={weight}
                    onChangeText={setWeight}
                />
            </View>
            <View style={[styles.formGroup, { flex: 1.5 }]}>
                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.genderContainer}>
                    <TouchableOpacity 
                        style={[styles.genderSegment, gender === 'MALE' && styles.activeGenderSegment]}
                        onPress={() => setGender('MALE')}
                    >
                        <Text style={gender === 'MALE' ? styles.activeGenderText : styles.genderText}>Đực</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.genderSegment, gender === 'FEMALE' && styles.activeGenderSegment]}
                        onPress={() => setGender('FEMALE')}
                    >
                        <Text style={gender === 'FEMALE' ? styles.activeGenderText : styles.genderText}>Cái</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Ngày Sinh</Text>
            <TextInput 
                style={styles.input} 
                placeholder="1.1.2026" 
                placeholderTextColor="#A5B2C0"
                value={dob}
                onChangeText={setDob}
            />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Save Pet →</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
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
  inactiveDot: { backgroundColor: '#FCD7D7' },
  stepText: { textAlign: 'center', fontSize: 12, color: '#8A9AA9', fontWeight: '500', marginBottom: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#FFFDFD', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#FFC8C8', borderStyle: 'solid', overflow: 'hidden' },
  avatarImage: { width: 110, height: 110, borderRadius: 55 },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  uploadBtnText: { color: '#ED4D4D', fontSize: 10, fontWeight: 'bold', marginTop: 4, letterSpacing: 0.5 },
  uploadSubtext: { fontSize: 13, color: '#8A9AA9', fontWeight: '500' },
  formGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#1B2530', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#FFEBEB', paddingHorizontal: 20, paddingVertical: 14, fontSize: 15, color: '#1B2530' },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 4 },
  typeCol: { alignItems: 'center' },
  typeBtnCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', borderWidth: 1, borderColor: '#FFEBEB', justifyContent: 'center', alignItems: 'center', marginBottom: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  activeTypeBtnCircle: { borderColor: '#EC4B4B', backgroundColor: '#FFFDFD' },
  typeTextBelow: { fontSize: 12, color: '#8A9AA9', fontWeight: '500' },
  activeTypeTextBelow: { color: '#EC4B4B', fontWeight: 'bold' },
  rowForm: { flexDirection: 'row', alignItems: 'center' },
  genderContainer: { flexDirection: 'row', backgroundColor: '#FFF0F0', borderRadius: 24, padding: 4, height: 50, alignItems: 'center', borderWidth: 1, borderColor: '#FFEBEB' },
  genderSegment: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  activeGenderSegment: { backgroundColor: '#EC4B4B' },
  genderText: { fontSize: 14, color: '#8A9AA9', fontWeight: '600' },
  activeGenderText: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
  button: { backgroundColor: '#EC4B4B', borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginTop: 12, shadowColor: '#EC4B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  breedScroll: { paddingVertical: 4 },
  breedChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#FFEBEB', marginRight: 8, height: 40, justifyContent: 'center' },
  activeBreedChip: { backgroundColor: '#EC4B4B', borderColor: '#EC4B4B' },
  breedChipText: { fontSize: 13, color: '#8A9AA9', fontWeight: '600' },
  activeBreedChipText: { color: '#fff', fontWeight: 'bold' },
});
