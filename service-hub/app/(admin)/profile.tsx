import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { PhotoPickerModal } from '../../components/ui/PhotoPickerModal';
import { useAuth } from '../../store/authStore';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  LogOut,
  KeyRound,
  CheckCircle2,
  Camera,
} from 'lucide-react-native';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';

export default function AdminProfileScreen() {
  const router = useRouter();
  const { user, logout, updatePassword, updateProfile } = useAuth();

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info' | 'destructive' | 'confirm';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const handleChangePassword = async () => {
    Keyboard.dismiss();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setAlertConfig({
        visible: true,
        title: 'Required Fields',
        message: 'Please fill in all password fields.',
        type: 'warning',
        onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    if (newPassword.length < 6) {
      setAlertConfig({
        visible: true,
        title: 'Invalid Password',
        message: 'New password must be at least 6 characters long.',
        type: 'warning',
        onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertConfig({
        visible: true,
        title: 'Password Mismatch',
        message: 'New password and confirm password do not match.',
        type: 'warning',
        onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    setLoading(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setAlertConfig({
        visible: true,
        title: 'Password Updated',
        message: 'Your administrator password has been updated successfully. Your new password is now active.',
        type: 'success',
        onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Failed to change password. Please check your current password.';
      setAlertConfig({
        visible: true,
        title: 'Update Failed',
        message: msg,
        type: 'error',
        onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAlertConfig({
      visible: true,
      title: 'Sign Out',
      message: 'Are you sure you want to end your administrator session?',
      type: 'destructive',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        await logout();
        router.replace('/(auth)/onboarding');
      },
      onCancel: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  const handlePhotoSelect = async (imageUri: string) => {
    try {
      await updateProfile({ profileImage: imageUri });
      setAlertConfig({
        visible: true,
        title: 'Profile Picture Updated',
        message: 'Admin avatar has been updated successfully.',
        type: 'success',
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Update Failed',
        message: 'Failed to update admin picture.',
        type: 'error',
      });
    }
  };

  const handlePhotoRemove = async () => {
    try {
      await updateProfile({ profileImage: '' });
      setAlertConfig({
        visible: true,
        title: 'Picture Removed',
        message: 'Reverted to default system icon.',
        type: 'info',
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Update Failed',
        message: 'Failed to remove picture.',
        type: 'error',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Profile</Text>
          <Text style={styles.subtitle}>Security credentials & account settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.8}
            accessibilityLabel="Change admin photo"
          >
            <Avatar
              uri={user?.profileImage || ''}
              name={user?.name || 'Administrator'}
              size={72}
              isOnline={true}
            />
            <View style={styles.cameraBadge}>
              <Camera size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user?.name || 'Administrator'}</Text>
              <ShieldCheck size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoRow}>
              <Mail size={13} color={COLORS.textMuted} />
              <Text style={styles.email}>{user?.email || 'No email registered'}</Text>
            </View>
            {Boolean(user?.phone) && (
              <View style={styles.infoRow}>
                <Phone size={13} color={COLORS.textMuted} />
                <Text style={styles.phone}>{user?.phone}</Text>
              </View>
            )}
            <View style={styles.roleActionRow}>
              <View style={styles.roleChip}>
                <Text style={styles.roleText}>SUPER ADMIN</Text>
              </View>
              <TouchableOpacity
                style={styles.photoActionButton}
                onPress={() => setShowPhotoModal(true)}
                activeOpacity={0.7}
              >
                <Camera size={12} color={COLORS.primary} />
                <Text style={styles.photoActionText}>
                  {user?.profileImage ? 'Change Photo' : 'Add Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Security / Password Change Card */}
        <View style={styles.securityCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <KeyRound size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Change Password</Text>
              <Text style={styles.cardSubtitle}>
                Update your login credentials securely
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <Input
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              prefixIcon={<Lock size={16} color={COLORS.textMuted} />}
              suffixIcon={
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={16} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              }
            />

            <Input
              label="New Password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              prefixIcon={<Lock size={16} color={COLORS.textMuted} />}
              suffixIcon={
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? (
                    <EyeOff size={16} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={16} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              prefixIcon={<Lock size={16} color={COLORS.textMuted} />}
              suffixIcon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={16} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              }
            />

            <Button
              title="Update Password"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleChangePassword}
              icon={<CheckCircle2 size={18} color="#FFFFFF" />}
              style={{ marginTop: 6 }}
            />
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.infoNotice}>
          <ShieldCheck size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
          <Text style={styles.infoNoticeText}>
            Secure session encryption is active. Password changes take effect immediately across all sessions.
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <LogOut size={18} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out of Admin Console</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Photo Picker Modal */}
      <PhotoPickerModal
        visible={showPhotoModal}
        currentImage={user?.profileImage}
        title="Admin Profile Photo"
        subtitle="Upload a profile picture or keep the default icon"
        onSelectImage={handlePhotoSelect}
        onRemoveImage={handlePhotoRemove}
        onClose={() => setShowPhotoModal(false)}
      />

      {/* Themed Feedback Pop-up Modal */}
      <ThemedAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={
          alertConfig.onConfirm ||
          (() => setAlertConfig((prev) => ({ ...prev, visible: false })))
        }
        onCancel={
          alertConfig.onCancel ||
          (() => setAlertConfig((prev) => ({ ...prev, visible: false })))
        }
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
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  email: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  phone: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  roleActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  roleChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  photoActionText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  securityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  form: {
    gap: 4,
  },
  infoNotice: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: RADIUS.md,
    gap: 10,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoNoticeText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    lineHeight: 18,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
  },
});
