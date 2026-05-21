import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true); setError('');
    const result = await register({ email, password, full_name: fullName });
    setLoading(false);
    if (result?.success) {
      router.replace('/(auth)/login');
    } else {
      setError(result?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join PetCare Hub</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.imagePlaceholder}>
           <IconSymbol name="paw.fill" size={60} color="#66BB6A" />
        </View>

        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Join our community of pet lovers today! We can't wait to meet your furry friends.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input} placeholder="Enter your full name"
              value={fullName} onChangeText={setFullName}
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input} placeholder="yourname@example.com"
              value={email} onChangeText={setEmail}
              autoCapitalize="none" keyboardType="email-address"
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input} placeholder="Create a password"
              value={password} onChangeText={setPassword} secureTextEntry
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input} placeholder="Repeat your password"
              value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry
            />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or sign up with</Text>
            <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
            <View style={styles.socialCircle}><Text style={{fontWeight: 'bold'}}>G</Text></View>
            <View style={styles.socialCircle}><Text style={{fontWeight: 'bold', color: '#1877F2'}}>f</Text></View>
            <View style={styles.socialCircle}><IconSymbol name="house.fill" size={16} color="#000" /></View>
        </View>

        <View style={styles.loginRow}>
            <Text style={styles.noAccountText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  imagePlaceholder: { width: '100%', height: 160, backgroundColor: '#E8F5E9', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 20, paddingHorizontal: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#FFEBEB', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1a1a1a' },
  button: { backgroundColor: '#FF4D4D', borderRadius: 24, paddingVertical: 18, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F0F0F0' },
  dividerText: { marginHorizontal: 12, color: '#999', fontSize: 12 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 },
  socialCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  noAccountText: { color: '#666', fontSize: 12 },
  loginText: { color: '#FF4D4D', fontSize: 12, fontWeight: 'bold' },
  error: { color: '#FF4D4D', textAlign: 'center', marginBottom: 16, fontSize: 14 },
});
