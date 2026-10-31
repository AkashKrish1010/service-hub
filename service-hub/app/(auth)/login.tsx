import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';
import { useAuth } from '../../store/authStore';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, User } from 'lucide-react-native';

export default function Login() {
  const router = useRouter();
  const { defaultRole } = useLocalSearchParams<{ defaultRole?: string }>();
  const [role, setRole] = useState<string>(defaultRole || 'customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    confirmText?: string;
  }>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'OK',
  });

  const { login } = useAuth();

  const handleLogin = async () => {
    Keyboard.dismiss();
    const trimmedIdentifier = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedIdentifier || !trimmedPassword) {
      setAlertConfig({
        visible: true,
        title: 'Required Fields',
        message: 'Please enter your name or email and password.',
        type: 'warning',
        confirmText: 'OK',
      });
      return;
    }

    setLoading(true);
    try {
      await login({
        email: trimmedIdentifier,
        name: trimmedIdentifier,
        password: trimmedPassword,
        role,
      });

      // Navigate based on logged in role
      if (role === 'provider') {
        router.replace('/(provider)/dashboard');
      } else if (role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(customer)');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials or login failed.';
      setAlertConfig({
        visible: true,
        title: 'Sign In Failed',
        message: msg,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Top Role Switcher Pills */}
        <View style={styles.topRoleSegment}>
          <TouchableOpacity
            style={[styles.roleSegmentPill, role === 'customer' && styles.roleSegmentPillActive]}
            onPress={() => setRole('customer')}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleSegmentText, role === 'customer' && styles.roleSegmentTextActive]}>
              Customer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleSegmentPill, role === 'provider' && styles.roleSegmentPillActive]}
            onPress={() => setRole('provider')}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleSegmentText, role === 'provider' && styles.roleSegmentTextActive]}>
              Provider
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleSegmentPill, role === 'admin' && styles.roleSegmentPillActive]}
            onPress={() => setRole('admin')}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleSegmentText, role === 'admin' && styles.roleSegmentTextActive]}>
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Name or Email Address"
            placeholder="Enter your name or email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="words"
            prefixIcon={<User size={16} color={COLORS.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            prefixIcon={<Lock size={16} color={COLORS.textMuted} />}
            suffixIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={16} color={COLORS.textMuted} />
                ) : (
                  <Eye size={16} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
            }
          />

          <Button
            title={`Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleLogin}
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            style={{ marginTop: 8 }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ThemedAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText || 'OK'}
        onConfirm={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    padding: 6,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  topRoleSegment: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    padding: 4,
    borderRadius: RADIUS.full,
    marginBottom: 20,
    gap: 4,
  },
  roleSegmentPill: {
    flex: 1,
    height: 38,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleSegmentPillActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  roleSegmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  roleSegmentTextActive: {
    color: '#FFFFFF',
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  signupLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
