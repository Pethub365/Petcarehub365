import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function ProfileSetupScreen() {
  const { updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập bị từ chối', 'Ứng dụng cần quyền truy cập thư viện ảnh để cập nhật ảnh đại diện.');
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

  const handleNext = async () => {
    if (!fullName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', fullName.trim());
      formData.append('phone', phone.trim());
      formData.append('bio', address.trim()); // Lưu tạm địa chỉ vào bio hoặc trường tương đương

      if (avatarUri) {
        const uriParts = avatarUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('avatar', {
          uri: Platform.OS === 'ios' ? avatarUri.replace('file://', '') : avatarUri,
          name: `avatar.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const res = await updateProfile(formData);
      if (res?.success) {
        router.push('/(setup)/pet-setup-1');
      } else {
        Alert.alert('Lỗi', res?.message || 'Không thể lưu thông tin hồ sơ.');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      Alert.alert('Lỗi', err.message || 'Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#1A2E35" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thiết lập hồ sơ chủ nuôi</Text>
            <View style={{ width: 24 }} />
        </View>

        <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarCircle}>
                {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                    // Match the custom beige rounded card illustration from the screenshot
                    <View style={styles.avatarIllustration}>
                      <View style={styles.sketchCard}>
                        <View style={styles.sketchCircle} />
                      </View>
                    </View>
                )}
                <View style={styles.editIconCircle}>
                    <FontAwesome name="pencil" size={12} color="#fff" />
                </View>
            </TouchableOpacity>
            <Text style={styles.uploadText}>Tải lên ảnh đại diện</Text>
            <Text style={styles.uploadSubtext}>Nhấp để thay đổi ảnh</Text>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#8F9CA3" />
                <TextInput style={styles.input} placeholder="Nhập họ và tên của bạn" placeholderTextColor="#A0AAB0" value={fullName} onChangeText={setFullName} />
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#8F9CA3" />
                <TextInput style={styles.input} placeholder="Nhập số điện thoại liên hệ" placeholderTextColor="#A0AAB0" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Địa chỉ/Khu vực sinh sống</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={20} color="#8F9CA3" />
                <TextInput style={styles.input} placeholder="Nhập địa chỉ của bạn" placeholderTextColor="#A0AAB0" value={address} onChangeText={setAddress} />
            </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext} disabled={loading}>
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>Lưu và Tiếp tục →</Text>
            )}
        </TouchableOpacity>
        
        <Text style={styles.footerInfo}>Thông tin của bạn được bảo mật theo chính sách của PetCare Hub.</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  content: { flexGrow: 1, padding: 24, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1A2E35', letterSpacing: -0.5 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarCircle: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: '#E5D5C5', // Base beige color
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16, 
    position: 'relative' 
  },
  avatarImage: { width: 120, height: 120, borderRadius: 60 },
  avatarIllustration: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sketchCard: {
    width: 56,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sketchCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5D5C5',
  },
  editIconCircle: { 
    position: 'absolute', 
    bottom: 4, 
    right: 4, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#FF3B30', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2.5, 
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadText: { fontSize: 16, fontWeight: '900', color: '#1A2E35', marginBottom: 4 },
  uploadSubtext: { fontSize: 12, color: '#FF3B30', fontWeight: '600' },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#1A2E35', marginBottom: 8 },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    borderWidth: 1.5, 
    borderColor: '#FFEBEB', 
    paddingHorizontal: 20,
    height: 56,
  },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#1A2E35', marginLeft: 12 },
  button: { 
    backgroundColor: '#FF3B30', 
    borderRadius: 28, 
    height: 56, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 24, 
    marginBottom: 16,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerInfo: { textAlign: 'center', fontSize: 12, color: '#8F9CA3', paddingHorizontal: 20, lineHeight: 18 },
});
