import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import petApi from '../apis/petApi';

export default function Index() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const routeUser = async () => {
      if (isAuthenticated && user) {
        if (!user.profile?.full_name) {
          router.replace('/(setup)/profile-setup');
        } else {
          try {
            const res = await petApi.getPets() as any;
            if (res && res.success && res.data?.pets?.length > 0) {
              router.replace('/(tabs)');
            } else {
              router.replace('/(setup)/pet-setup-1');
            }
          } catch (error) {
            console.error('Lỗi khi kiểm tra thú cưng tại trang chủ:', error);
            // Redirect to dashboard rather than forcing pet setup on transient network error
            router.replace('/(tabs)');
          }
        }
      } else {
        router.replace('/(onboarding)/loading1');
      }
    };

    routeUser();
  }, [loading, isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF4D4D" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
