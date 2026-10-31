import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';
import { useAuth } from '../../store/authStore';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react-native';

export default function Signup() {
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    confirmText?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const { register } = useAuth();

  const handleSignup = async () => {
    Keyboard.dismiss();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Required Fields',
        message: 'Please fill in your name, email, and password.',
        type: 'warning',
        confirmText: 'OK',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    setLoading(true);
    try {
      const cleanedPhone = phone.trim().replace(/\s+/g, '');
      const formattedPhone = cleanedPhone
        ? (cleanedPhone.startsWith('+91') ? cleanedPhone : `+91 ${cleanedPhone}`)
        : '';
      await register({ name, email, phone: formattedPhone, password, role });
      setAlertConfig({
        visible: true,
        title: 'Account Created',
        message:
          role === 'provider'
            ? 'Registration successful! Your provider profile will be reviewed by admin.'
            : 'Welcome to Service Hub! Your account is ready.',
        type: 'success',
        confirmText: 'Continue',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          if (role === 'provider') {
            router.replace('/(provider)/dashboard');
          } else {
            router.replace('/(customer)');
          }
        },
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      setAlertConfig({
        visible: true,
        title: 'Registration Error',
        message: msg,
        type: 'error',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Service Hub today</Text>
        </View>

        {/* Role Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, role === 'customer' && styles.toggleBtnActive]}
            onPress={() => setRole('customer')}
          >
            <Text style={[styles.toggleText, role === 'customer' && styles.toggleTextActive]}>
              Customer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, role === 'provider' && styles.toggleBtnActive]}
            onPress={() => setRole('provider')}
          >
            <Text style={[styles.toggleText, role === 'provider' && styles.toggleTextActive]}>
              Service Provider
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            prefixIcon={<User size={16} color={COLORS.textMuted} />}
          />

          <Input
            label="Email Address"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            prefixIcon={<Mail size={16} color={COLORS.textMuted} />}
          />

          <Input
            label="Mobile Number"
            placeholder="98765 43210"
            value={phone}
            onChangeText={(text) => {
              const clean = text.replace(/^\+91\s*/, '').replace(/[^\d\s-]/g, '');
              setPhone(clean);
            }}
            keyboardType="phone-pad"
            maxLength={12}
            prefixIcon={
              <View style={styles.phonePrefix}>
                <Phone size={16} color={COLORS.textMuted} />
                <Text style={styles.countryCodeText}>+91</Text>
                <View style={styles.prefixDivider} />
              </View>
            }
          />

          <Input
            label="Password"
            placeholder="Minimum 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            prefixIcon={<Lock size={16} color={COLORS.textMuted} />}
          />

          <Button
            title="Create Account"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleSignup}
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            style={{ marginTop: 8 }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ThemedAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        onConfirm={alertConfig.onConfirm}
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
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  toggleTextActive: {
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
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  prefixDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
    marginLeft: 4,
  },
});
