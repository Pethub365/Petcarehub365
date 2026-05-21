import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileEditScreen() {
  const [fullName, setFullName] = useState('Nguyễn Văn An');
  const [phone, setPhone] = useState('0987654321');
  const [email, setEmail] = useState('an.nguyen@petcarehub.vn');

  const handleSave = () => {
    Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

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
            <View style={styles.avatarCircle}>
                <IconSymbol name="person.fill" size={40} color="#fff" />
                <View style={styles.editIconCircle}>
                    <IconSymbol name="camera.fill" size={14} color="#fff" />
                </View>
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={[styles.input, {color: '#999', backgroundColor: '#F8F8F8'}]} value={email} editable={false} />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  content: { padding: 20, flex: 1 },
  avatarSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFD1D1', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  editIconCircle: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF4D4D', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FAFAFA' },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1a1a1a' },
  saveBtn: { backgroundColor: '#FF4D4D', paddingVertical: 18, borderRadius: 24, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
