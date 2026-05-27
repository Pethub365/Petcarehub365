import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const storage = require('../../utils/storage');
        const savedRemember = await storage.getStorageItem('remember_me');
        if (savedRemember === 'true') {
          setRememberMe(true);
          const savedEmail = await storage.getStorageItem('saved_email');
          const savedPass = await storage.getStorageItem('saved_password');
          if (savedEmail) setIdentifier(savedEmail);
          if (savedPass) setPassword(savedPass);
        }
      } catch (e) {
        console.error('Lỗi khi tải thông tin ghi nhớ mật khẩu:', e);
      }
    };
    loadSavedCredentials();
  }, []);

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('Vui lòng nhập Email và Mật khẩu');
      return;
    }
    setLoading(true); setError('');
    const result = await login(identifier, password);
    setLoading(false);
    if (result?.success) {
      // Lưu hoặc xóa thông tin đăng nhập tùy theo trạng thái check ghi nhớ
      const storage = require('../../utils/storage');
      if (rememberMe) {
        await storage.setStorageItem('remember_me', 'true');
        await storage.setStorageItem('saved_email', identifier);
        await storage.setStorageItem('saved_password', password);
      } else {
        await storage.setStorageItem('remember_me', 'false');
        await storage.removeStorageItem('saved_email');
        await storage.removeStorageItem('saved_password');
      }

      const userStr = await storage.getStorageItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.profile?.full_name) {
          router.replace('/(setup)/profile-setup');
      } else {
          try {
              const res = await require('../../apis/petApi').default.getPets();
              if (res && res.success && res.data?.pets?.length > 0) {
                  router.replace('/(tabs)');
              } else {
                  router.replace('/(setup)/pet-setup-1');
              }
          } catch (e) {
              console.error('Lỗi khi tải thú cưng sau khi đăng nhập:', e);
              // Fallback to tabs rather than forcing pet setup on transient network error
              router.replace('/(tabs)');
          }
      }
    } else {
      setError(result?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.header}>
              <View style={styles.iconCircle}>
                <FontAwesome name="paw" size={28} color="#FF3B30" />
              </View>
              <Text style={styles.title}>PetCare Hub</Text>
              <Text style={styles.subtitle}>{"Level up your pet's happiness"}</Text>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập email..."
                placeholderTextColor="#A0AAB0"
                value={identifier} onChangeText={setIdentifier}
                autoCapitalize="none" keyboardType="email-address"
              />
          </View>

          <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu..."
                placeholderTextColor="#A0AAB0"
                value={password} onChangeText={setPassword}
                secureTextEntry
              />
          </View>

          <View style={styles.rememberRow}>
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <FontAwesome name="check" size={10} color="#fff" />}
              </View>
              <Text style={styles.rememberText}>Ghi nhớ mật khẩu</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

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
        </View>

        <View style={styles.dailyReward}>
            <View style={styles.badgeStarCircle}>
              <FontAwesome name="star" size={10} color="#fff" />
            </View>
            <Text style={styles.dailyRewardText}>Nhận 50 XP bằng cách login hằng ngày</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  content: { flexGrow: 1, padding: 20, justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 36,
    paddingHorizontal: 24,
    paddingVertical: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  header: { alignItems: 'center', marginBottom: 24 },
  iconCircle: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: '#FFEBEB', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  title: { fontSize: 22, fontWeight: '900', color: '#1A2E35', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#8F9CA3', marginBottom: 20, fontWeight: '500' },
  welcomeText: { fontSize: 28, fontWeight: '900', color: '#1A2E35', letterSpacing: -0.5 },
  formGroup: { marginBottom: 16, width: '100%' },
  label: { fontSize: 14, fontWeight: '700', color: '#1A2E35', marginBottom: 8 },
  input: { 
    backgroundColor: '#F4F5F7', 
    borderRadius: 24, 
    paddingHorizontal: 20, 
    height: 56, 
    fontSize: 15, 
    color: '#1A2E35' 
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  rememberText: {
    fontSize: 13,
    color: '#8F9CA3',
    fontWeight: '500',
  },
  forgotPassText: { color: '#FF3B30', fontSize: 13, fontWeight: '600' },
  button: { 
    backgroundColor: '#FF3B30', 
    borderRadius: 28, 
    height: 56, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EAEAEA' },
  dividerText: { marginHorizontal: 12, color: '#8F9CA3', fontSize: 13, fontWeight: '500' },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 24, width: '100%' },
  socialBtn: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#EAEAEA', 
    borderRadius: 28, 
    height: 56, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  socialBtnText: { fontSize: 15, fontWeight: '700', color: '#1A2E35' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', width: '100%' },
  noAccountText: { color: '#8F9CA3', fontSize: 14 },
  registerText: { color: '#FF3B30', fontSize: 14, fontWeight: 'bold' },
  dailyReward: { 
    backgroundColor: '#FFEBEB', 
    borderRadius: 24, 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 24,
    alignSelf: 'center',
  },
  badgeStarCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dailyRewardText: { color: '#FF3B30', fontSize: 12, fontWeight: '600' },
  error: { color: '#FF3B30', textAlign: 'center', marginBottom: 16, fontSize: 14, fontWeight: '500' },
});
