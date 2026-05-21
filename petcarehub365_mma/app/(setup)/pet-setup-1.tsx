import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PetSetup1Screen() {
  const [petType, setPetType] = useState('Chó');

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pet</Text>
            <View style={{ width: 24 }} />
        </View>

        <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.activeDot]} />
            <View style={styles.progressDot} />
        </View>
        <Text style={styles.stepText}>Step 1 of 2</Text>

        <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
                <IconSymbol name="camera.fill" size={32} color="#FF4D4D" />
                <Text style={styles.uploadBtnText}>UPLOAD</Text>
            </View>
            <Text style={styles.uploadSubtext}>Tải lên ảnh thú cưng của bạn</Text>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Tên Pet</Text>
            <TextInput style={styles.input} placeholder="Ex: Rudy" />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Loài thú cưng</Text>
            <View style={styles.typeRow}>
                {['Chó', 'Mèo', 'Khác'].map((type) => (
                    <TouchableOpacity 
                        key={type} 
                        style={[styles.typeBtn, petType === type && styles.activeTypeBtn]}
                        onPress={() => setPetType(type)}
                    >
                        <IconSymbol name="paw.fill" size={20} color={petType === type ? '#FF4D4D' : '#999'} />
                        <Text style={[styles.typeText, petType === type && styles.activeTypeText]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Đặc điểm đặc biệt</Text>
            <TextInput style={styles.input} placeholder="Ex: Nhiều lông,..." />
        </View>

        <View style={styles.rowForm}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 16 }]}>
                <Text style={styles.label}>Cân nặng (kg)</Text>
                <TextInput style={styles.input} placeholder="5.0" keyboardType="numeric" />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.genderRow}>
                    <TouchableOpacity style={[styles.genderBtn, styles.activeGenderBtn]}><Text style={styles.activeGenderText}>Đực</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.genderBtn}><Text style={styles.genderText}>Cái</Text></TouchableOpacity>
                </View>
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Ngày Sinh</Text>
            <TextInput style={styles.input} placeholder="1.1.2024" />
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/(setup)/pet-setup-2')}>
            <Text style={styles.buttonText}>Save Pet →</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  progressDot: { width: 24, height: 6, borderRadius: 3, backgroundColor: '#E5E5E5' },
  activeDot: { backgroundColor: '#FF4D4D' },
  stepText: { textAlign: 'center', fontSize: 12, color: '#999', marginBottom: 30 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#FFD1D1', borderStyle: 'dashed' },
  uploadBtnText: { color: '#FF4D4D', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  uploadSubtext: { fontSize: 13, color: '#666' },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1a1a1a' },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', gap: 4 },
  activeTypeBtn: { borderColor: '#FF4D4D', backgroundColor: '#FFF5F5' },
  typeText: { fontSize: 13, color: '#999', fontWeight: '500' },
  activeTypeText: { color: '#FF4D4D', fontWeight: 'bold' },
  rowForm: { flexDirection: 'row' },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5' },
  activeGenderBtn: { backgroundColor: '#FF4D4D', borderColor: '#FF4D4D' },
  genderText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeGenderText: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
  button: { backgroundColor: '#FF4D4D', borderRadius: 24, paddingVertical: 18, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
