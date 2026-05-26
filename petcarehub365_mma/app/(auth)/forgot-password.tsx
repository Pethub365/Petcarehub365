import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal, Alert
} from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import authApi from '../../apis/authApi';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP & Reset Modal state
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleRequestOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Địa chỉ email không hợp lệ');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authApi.forgotPassword(email) as any;
      setLoading(false);
      if (res && res.success) {
        Alert.alert(
          'Đã gửi yêu cầu',
          'Nếu email tồn tại trên hệ thống, mã xác thực OTP khôi phục mật khẩu đã được gửi đến email của bạn.'
        );
        setResetModalVisible(true);
      } else {
        setError(res?.message || 'Không thể gửi mã xác thực. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra kết nối mạng.');
    }
  };

  const handleResetPassword = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đủ 6 số OTP.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Thiếu thông tin', 'Mật khẩu mới phải dài tối thiểu 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp', 'Mật khẩu mới và mật khẩu xác nhận không khớp nhau.');
      return;
    }

    try {
      setResetting(true);
      const res = await authApi.resetPassword({ email, otp, newPassword }) as any;
      setResetting(false);
      if (res && res.success) {
        Alert.alert(
          'Thành công',
          'Mật khẩu của bạn đã được đặt lại thành công. Hãy sử dụng mật khẩu mới để đăng nhập.',
          [
            {
              text: 'Đăng nhập ngay',
              onPress: () => {
                setResetModalVisible(false);
                router.replace('/(auth)/login');
              }
            }
          ]
        );
      } else {
        Alert.alert('Thất bại', res?.message || 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại OTP.');
      }
    } catch (err: any) {
      setResetting(false);
      Alert.alert('Lỗi', err.response?.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại OTP.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.right" size={24} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quên mật khẩu</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.imagePlaceholder}>
          <IconSymbol name="lock.shield.fill" size={60} color="#FF4D4D" />
        </View>

        <Text style={styles.title}>Khôi Phục Mật Khẩu</Text>
        <Text style={styles.subtitle}>
          Vui lòng nhập địa chỉ email đã đăng ký tài khoản. Chúng tôi sẽ gửi mã OTP gồm 6 chữ số để bạn thiết lập lại mật khẩu mới.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Địa chỉ Email</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Gửi mã OTP</Text>}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.noAccountText}>Nhớ mật khẩu? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reset password with OTP Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={resetModalVisible}
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thiết lập mật khẩu mới</Text>
            <Text style={styles.modalDesc}>
              Mã OTP gồm 6 chữ số đã được gửi đến email <Text style={{ fontWeight: 'bold' }}>{email}</Text>. Vui lòng nhập mã và mật khẩu mới bên dưới:
            </Text>

            <TextInput
              placeholder="Nhập 6 số OTP"
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              placeholderTextColor="#aaa"
            />

            <TextInput
              placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
              style={styles.modalTextInput}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor="#aaa"
            />

            <TextInput
              placeholder="Xác nhận mật khẩu mới"
              style={styles.modalTextInput}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#aaa"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setResetModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleResetPassword} disabled={resetting}>
                {resetting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Đặt lại mật khẩu</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  imagePlaceholder: { width: '100%', height: 140, backgroundColor: '#FFF5F5', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 20, paddingHorizontal: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#FFEBEB', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1a1a1a' },
  button: { backgroundColor: '#FF4D4D', borderRadius: 24, paddingVertical: 18, alignItems: 'center', marginTop: 16, marginBottom: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  noAccountText: { color: '#666', fontSize: 13 },
  loginText: { color: '#FF4D4D', fontSize: 13, fontWeight: 'bold' },
  error: { color: '#FF4D4D', textAlign: 'center', marginBottom: 16, fontSize: 14 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  modalDesc: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  otpInput: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, height: 48, width: '100%', marginBottom: 16, fontSize: 18, letterSpacing: 8, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  modalTextInput: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, height: 48, width: '100%', marginBottom: 16, fontSize: 14, color: '#333' },
  modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  modalBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F5F5F5' },
  cancelBtnText: { color: '#666', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#FF4D4D' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' }
});
