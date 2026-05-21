import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileSetupScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thiết lập hồ sơ chủ nuôi</Text>
            <View style={{ width: 24 }} />
        </View>

        <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
                <View style={styles.avatarPlaceholder} />
                <View style={styles.editIconCircle}>
                    <IconSymbol name="plus" size={14} color="#fff" />
                </View>
            </View>
            <Text style={styles.uploadText}>Tải lên ảnh đại diện</Text>
            <Text style={styles.uploadSubtext}>Nhập để thay đổi ảnh</Text>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputWrapper}>
                <IconSymbol name="person.fill" size={18} color="#999" />
                <TextInput style={styles.input} placeholder="Nhập họ và tên của bạn" value={fullName} onChangeText={setFullName} />
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputWrapper}>
                <IconSymbol name="phone.fill" size={18} color="#999" />
                <TextInput style={styles.input} placeholder="Nhập số điện thoại liên hệ" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Địa chỉ/Khu vực sinh sống</Text>
            <View style={styles.inputWrapper}>
                <IconSymbol name="mappin" size={18} color="#999" />
                <TextInput style={styles.input} placeholder="Nhập địa chỉ của bạn" value={address} onChangeText={setAddress} />
            </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/(setup)/pet-setup-1')}>
            <Text style={styles.buttonText}>Lưu và Tiếp tục →</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerInfo}>Thông tin của bạn được bảo mật theo chính sách của Pet Care Hub.</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flexGrow: 1, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, marginTop: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E5D5C5', justifyContent: 'center', alignItems: 'center', marginBottom: 16, position: 'relative' },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF' },
  editIconCircle: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF4D4D', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  uploadText: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  uploadSubtext: { fontSize: 12, color: '#FF4D4D' },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 16 },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: '#1a1a1a', marginLeft: 10 },
  button: { backgroundColor: '#FF4D4D', borderRadius: 24, paddingVertical: 18, alignItems: 'center', marginTop: 24, marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerInfo: { textAlign: 'center', fontSize: 11, color: '#999', paddingHorizontal: 20 },
});
