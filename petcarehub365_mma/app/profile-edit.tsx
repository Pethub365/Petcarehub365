import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImagePicker from 'expo-image-picker';
import userApi from '@/apis/userApi';

export default function ProfileEditScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await userApi.getProfile();
        const user = res.data?.user || res.data;
        if (user) {
          setFullName(user.profile?.full_name || '');
          setPhone(user.profile?.phone || '');
          setEmail(user.email || '');
          setAvatarUrl(user.profile?.avatar_url || null);
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Lỗi', 'Không thể tải thông tin cá nhân');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để thay đổi avatar.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setSelectedImage(pickerResult.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('phone', phone);

      if (selectedImage) {
        const cleanUri = selectedImage.split('?')[0];
        const uriParts = cleanUri.split('.');
        const fileExt = uriParts[uriParts.length - 1] || 'jpg';
        const fileType = fileExt.toLowerCase();
        
        formData.append('avatar', {
          uri: selectedImage,
          name: `avatar.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        } as any);
      }

      await userApi.updateProfile(formData);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật! 🐾', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin cá nhân';
      Alert.alert('Thất bại', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !email) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4D4D" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
            <View style={styles.avatarCircle}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.avatarImage} />
              ) : avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <IconSymbol name="person.fill" size={40} color="#fff" />
              )}
              <View style={styles.editIconCircle}>
                <IconSymbol name="camera.fill" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nhập họ và tên" placeholderTextColor="#aaa" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={[styles.input, { color: '#999', backgroundColor: '#F8F8F8' }]} value={email} editable={false} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Nhập số điện thoại" placeholderTextColor="#aaa" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  content: { padding: 20, flex: 1 },
  avatarSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFD1D1', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  editIconCircle: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF4D4D', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FAFAFA' },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1a1a1a' },
  saveBtn: { backgroundColor: '#FF4D4D', paddingVertical: 18, borderRadius: 24, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
