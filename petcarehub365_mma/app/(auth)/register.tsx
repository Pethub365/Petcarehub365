import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal, Alert, Image
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import authApi from '../../apis/authApi';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP Verification Modal
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 8) {
      setError('Mật khẩu phải dài tối thiểu 8 ký tự');
      return;
    }
    setLoading(true); setError('');
    const result = await register({ email, password, full_name: fullName });
    setLoading(false);
    
    if (result && (result.success || result.data)) {
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công! Vui lòng kiểm tra hộp thư email để nhận mã OTP xác thực.');
      setOtpModalVisible(true);
    } else {
      setError(result?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đủ 6 số OTP.');
      return;
    }
    try {
      setVerifying(true);
      const res = await authApi.verifyOtp({ email, otp }) as any;
      setVerifying(false);
      Alert.alert('Xác thực thành công!', 'Tài khoản của bạn đã được kích hoạt. Hãy tiến hành đăng nhập.', [
        { text: 'OK', onPress: () => {
          setOtpModalVisible(false);
          router.replace('/(auth)/login');
        }}
      ]);
    } catch (err: any) {
      setVerifying(false);
      Alert.alert('Lỗi', err.response?.data?.message || 'Kích hoạt tài khoản thất bại. Vui lòng kiểm tra lại OTP.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1A2E35" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join PetCare Hub</Text>
          <View style={{ width: 24 }} />
        </View>

        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop' }} 
          style={styles.heroImage} 
        />

        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>{"Join our community of pet lovers today! We can't wait to meet your furry friends."}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input} placeholder="Enter your full name"
            value={fullName} onChangeText={setFullName} placeholderTextColor="#A0AAB0"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input} placeholder="yourname@example.com"
            value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#A0AAB0"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput} placeholder="Create a password"
              value={password} onChangeText={setPassword} 
              secureTextEntry={securePassword} placeholderTextColor="#A0AAB0"
            />
            <TouchableOpacity onPress={() => setSecurePassword(!securePassword)} style={styles.eyeBtn}>
              <FontAwesome name={securePassword ? "eye" : "eye-slash"} size={18} color="#8F9CA3" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput} placeholder="Repeat your password"
              value={confirmPassword} onChangeText={setConfirmPassword} 
              secureTextEntry={secureConfirmPassword} placeholderTextColor="#A0AAB0"
            />
            <TouchableOpacity onPress={() => setSecureConfirmPassword(!secureConfirmPassword)} style={styles.eyeBtn}>
              <FontAwesome name={secureConfirmPassword ? "eye" : "eye-slash"} size={18} color="#8F9CA3" />
            </TouchableOpacity>
          </View>
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
            <TouchableOpacity style={styles.socialBtn}>
                <FontAwesome name="google" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
                <FontAwesome name="facebook" size={20} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
                <FontAwesome name="apple" size={20} color="#000" />
            </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.noAccountText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* OTP verification Modal */}
      <Modal animationType="slide" transparent={true} visible={otpModalVisible} onRequestClose={() => setOtpModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác thực OTP Email</Text>
            <Text style={styles.modalDesc}>
              Chúng tôi vừa gửi mã OTP xác minh gồm 6 số đến email <Text style={{ fontWeight: 'bold' }}>{email}</Text>. Vui lòng nhập mã vào đây:
            </Text>
            <TextInput
              placeholder="Nhập 6 số OTP"
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              placeholderTextColor="#A0AAB0"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setOtpModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleVerifyOtp} disabled={verifying}>
                {verifying ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Xác thực</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  content: { flexGrow: 1, padding: 24, paddingTop: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1A2E35', letterSpacing: -0.5 },
  heroImage: { 
    width: '100%', 
    height: 160, 
    borderRadius: 28, 
    marginBottom: 24 
  },
  title: { fontSize: 28, fontWeight: '900', color: '#1A2E35', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#5B7380', textAlign: 'center', marginBottom: 24, lineHeight: 20, paddingHorizontal: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#1A2E35', marginBottom: 8 },
  input: { 
    borderWidth: 1.5, 
    borderColor: '#FFEBEB', 
    borderRadius: 24, 
    paddingHorizontal: 20, 
    height: 56, 
    fontSize: 15, 
    color: '#1A2E35',
    backgroundColor: '#FFF',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFEBEB',
    borderRadius: 24,
    backgroundColor: '#FFF',
    paddingLeft: 20,
    paddingRight: 16,
    height: 56,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1A2E35',
  },
  eyeBtn: {
    padding: 8,
  },
  button: { 
    backgroundColor: '#FF3B30', 
    borderRadius: 28, 
    height: 56, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 12, 
    marginBottom: 24,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EAEAEA' },
  dividerText: { marginHorizontal: 12, color: '#8F9CA3', fontSize: 13, fontWeight: '500' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 },
  socialBtn: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    borderWidth: 1, 
    borderColor: '#EAEAEA', 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  noAccountText: { color: '#8F9CA3', fontSize: 14 },
  loginText: { color: '#FF3B30', fontSize: 14, fontWeight: 'bold' },
  error: { color: '#FF3B30', textAlign: 'center', marginBottom: 16, fontSize: 14, fontWeight: '500' },

  modalBg: { flex: 1, backgroundColor: 'rgba(26,46,53,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { 
    backgroundColor: '#fff', 
    borderRadius: 32, 
    padding: 32, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1A2E35', marginBottom: 12 },
  modalDesc: { fontSize: 14, color: '#5B7380', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  otpInput: { 
    borderWidth: 1.5, 
    borderColor: '#FFEBEB', 
    borderRadius: 24, 
    paddingHorizontal: 20, 
    height: 56, 
    width: '100%', 
    marginBottom: 24, 
    fontSize: 22, 
    letterSpacing: 6, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#1A2E35',
    backgroundColor: '#F8F9FA',
  },
  modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtn: { flex: 1, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F4F5F7' },
  cancelBtnText: { color: '#5B7380', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#FF3B30' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' }
});
