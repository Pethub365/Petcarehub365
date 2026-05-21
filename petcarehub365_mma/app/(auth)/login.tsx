import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LoginScreen() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('Vui lòng nhập Email và Mật khẩu');
      return;
    }
    setLoading(true); setError('');
    const result = await login(identifier, password);
    setLoading(false);
    if (result?.success) {
      const userStr = await require('../../utils/storage').getStorageItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.profile?.full_name || !user?.pets) {
          router.replace('/(setup)/profile-setup');
      } else {
          router.replace('/(tabs)');
      }
    } else {
      setError(result?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <View style={styles.iconCircle}>
              <IconSymbol name="paw.fill" size={32} color="#FF4D4D" />
            </View>
            <Text style={styles.title}>PetCare Hub</Text>
            <Text style={styles.subtitle}>Level up your pet's happiness</Text>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email..."
              value={identifier} onChangeText={setIdentifier}
              autoCapitalize="none" keyboardType="email-address"
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu..."
              value={password} onChangeText={setPassword}
              secureTextEntry
            />
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotPass}>
          <Text style={styles.forgotPassText}>Quên mật khẩu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc tiếp tục với</Text>
            <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialBtnText}>Facebook</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.registerRow}>
            <Text style={styles.noAccountText}>Không có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerText}>Đăng ký ngay!</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.dailyReward}>
            <IconSymbol name="star.fill" size={14} color="#FF4D4D" />
            <Text style={styles.dailyRewardText}> Nhận 50 XP bằng cách login hằng ngày</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFEBEB', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 20 },
  welcomeText: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: { backgroundColor: '#F8F8F8', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 15, color: '#1a1a1a' },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPassText: { color: '#FF4D4D', fontSize: 13, fontWeight: '600' },
  button: { backgroundColor: '#FF4D4D', borderRadius: 24, paddingVertical: 18, alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E5E5' },
  dividerText: { marginHorizontal: 12, color: '#999', fontSize: 13 },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 24 },
  socialBtn: { flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  socialBtnText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  noAccountText: { color: '#666', fontSize: 14 },
  registerText: { color: '#FF4D4D', fontSize: 14, fontWeight: 'bold' },
  dailyReward: { backgroundColor: '#FFF5E6', borderRadius: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dailyRewardText: { color: '#FF4D4D', fontSize: 12, fontWeight: '600' },
  error: { color: '#FF4D4D', textAlign: 'center', marginBottom: 16, fontSize: 14 },
});
