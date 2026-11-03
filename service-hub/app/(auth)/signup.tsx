import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';
import { useAuth } from '../../store/authStore';
import { categoryService } from '../../services/other.services';
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Briefcase,
  ChevronDown,
  Check,
  X,
  AlertCircle,
} from 'lucide-react-native';

export default function Signup() {
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Carpentry',
    'Appliances',
    'Painting',
    'Gardening',
    'General Services',
  ]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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

  useEffect(() => {
    categoryService.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const names = data.map((c: any) => c.name).filter(Boolean);
        if (names.length > 0) {
          setAvailableCategories(names);
          if (!names.includes(category)) {
            setCategory(names[0]);
          }
        }
      }
    }).catch(() => {});
  }, []);

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

    if (role === 'provider' && !category.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Category Required',
        message: 'Please select a service category for your provider account.',
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
      await register({
        name,
        email,
        phone: formattedPhone,
        password,
        role,
        category: role === 'provider' ? category : undefined,
      });
      setAlertConfig({
        visible: true,
        title: 'Account Created',
        message:
          role === 'provider'
            ? 'Registration submitted! Your provider profile is pending admin approval. You can log in, but public dispatch features will activate once approved.'
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

          {role === 'provider' && (
            <View style={styles.categoryPickerSection}>
              <Text style={styles.inputLabel}>PRIMARY SERVICE CATEGORY</Text>
              <TouchableOpacity
                style={styles.categorySelectorBtn}
                onPress={() => setShowCategoryModal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.categorySelectorLeft}>
                  <View style={styles.categoryIconCircle}>
                    <Briefcase size={16} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.selectedCategoryName}>{category}</Text>
                    <Text style={styles.categorySelectorHint}>Tap to choose your service field</Text>
                  </View>
                </View>
                <ChevronDown size={18} color={COLORS.textMuted} />
              </TouchableOpacity>

              <View style={styles.approvalNotice}>
                <AlertCircle size={15} color="#D97706" style={{ marginTop: 1 }} />
                <Text style={styles.approvalNoticeText}>
                  Provider accounts require administrative approval before receiving customer bookings.
                </Text>
              </View>
            </View>
          )}

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

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Trade Category</Text>
                <Text style={styles.modalSubtitle}>Choose your primary service field</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350 }}>
              {availableCategories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catOption, isSelected && styles.catOptionActive]}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryModal(false);
                    }}
                  >
                    <View style={styles.catOptionLeft}>
                      <View style={[styles.catOptionIcon, isSelected && styles.catOptionIconActive]}>
                        <Briefcase size={16} color={isSelected ? '#FFFFFF' : COLORS.primary} />
                      </View>
                      <Text style={[styles.catOptionText, isSelected && styles.catOptionTextActive]}>
                        {cat}
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
  categoryPickerSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  categorySelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  categorySelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  categorySelectorHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  approvalNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: RADIUS.sm,
    marginTop: 10,
  },
  approvalNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginBottom: 6,
  },
  catOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  catOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catOptionIconActive: {
    backgroundColor: COLORS.primary,
  },
  catOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  catOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
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
