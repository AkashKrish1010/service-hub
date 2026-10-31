import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../store/authStore';
import { COLORS } from '../constants/theme';
import { ShieldCheck } from 'lucide-react-native';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const navigateInitial = async () => {
      if (user) {
        if (user.role === 'provider') {
          router.replace('/(provider)/dashboard');
        } else if (user.role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(customer)');
        }
      } else {
        router.replace('/(auth)/onboarding');
      }
    };

    navigateInitial();
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <ShieldCheck size={36} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>Service Hub</Text>
      <Text style={styles.subtitle}>Connecting verified local pros</Text>
      <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
