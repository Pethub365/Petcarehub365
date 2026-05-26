import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import authApi from '@/apis/authApi';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đủ thông tin.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải dài tối thiểu 8 ký tự.');
      return;
    }

    try {
      setLoading(true);
      await authApi.changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword
      });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công! 🔑', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Lỗi', err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.desc}>Để đảm bảo bảo mật, vui lòng nhập mật khẩu hiện tại trước khi tạo mật khẩu mới.</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <TextInput style={styles.input} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} placeholder="Nhập mật khẩu hiện tại" placeholderTextColor="#aaa" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="Tối thiểu 8 ký tự" placeholderTextColor="#aaa" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
          <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Nhập lại mật khẩu mới ở trên" placeholderTextColor="#aaa" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Cập nhật mật khẩu</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  content: { padding: 20, flex: 1 },
  desc: { fontSize: 13, color: '#666', lineHeight: 20, marginBottom: 24 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1a1a1a' },
  saveBtn: { backgroundColor: '#1a1a1a', paddingVertical: 18, borderRadius: 24, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
