import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PhotoPickerModal } from '../../components/ui/PhotoPickerModal';
import { useAuth } from '../../store/authStore';
import {
  MapPin,
  Clock,
  AlertCircle,
  LogOut,
  ChevronRight,
  Shield,
  Phone,
  Mail,
  User as UserIcon,
  Sparkles,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  Camera,
} from 'lucide-react-native';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updatePassword, updateProfile } = useAuth();

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loadingPassword, setLoadingPassword] = useState(false);

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

    setLoadingPassword(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
      setAlertConfig({
        visible: true,
        title: 'Password Updated',
        message: 'Your password has been changed successfully. Your new password is now active.',
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
      setLoadingPassword(false);
    }
  };

  const handleLogout = () => {
    setAlertConfig({
      visible: true,
      title: 'Sign Out',
      message: 'Are you sure you want to end your current session?',
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

  const menuItems = [
    {
      title: 'Saved Addresses',
      subtitle: user?.address || 'Set your primary service address',
      icon: MapPin,
      onPress: () =>
        setAlertConfig({
          visible: true,
          title: 'Primary Saved Address',
          message: user?.address || 'No address saved yet. You can provide your address when requesting a booking.',
          type: 'info',
          onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
        }),
    },
    {
      title: 'Service History',
      subtitle: 'View previous invoices & receipts',
      icon: Clock,
      onPress: () => router.push('/(customer)/bookings'),
    },
    {
      title: 'App Walkthrough',
      subtitle: 'Review features & onboarding guide',
      icon: Sparkles,
      onPress: () => router.push('/(auth)/onboarding'),
    },
    {
      title: 'Raise a Complaint',
      subtitle: 'Dispute a booking or report an issue',
      icon: AlertCircle,
      onPress: () => router.push('/complaint/new'),
    },
    {
      title: 'Security & Password',
      subtitle: 'Change your account password',
      icon: KeyRound,
      onPress: () => setShowPasswordModal(true),
    },
    {
      title: 'Terms & Safety Policy',
      subtitle: 'Verified provider protection',
      icon: Shield,
      onPress: () =>
        setAlertConfig({
          visible: true,
          title: 'Service Hub Safety Policy',
          message:
            'All technicians undergo in-person background verification and skill certifications before job dispatch.',
          type: 'info',
          onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
        }),
    },
  ];

  const handlePhotoSelect = async (imageUri: string) => {
    try {
      await updateProfile({ profileImage: imageUri });
      setAlertConfig({
        visible: true,
        title: 'Profile Picture Updated',
        message: 'Your profile picture has been saved successfully.',
        type: 'success',
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Update Failed',
        message: 'Failed to update profile picture.',
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
        message: 'Reverted to default app icon.',
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
          <Text style={styles.title}>Account</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.8}
            accessibilityLabel="Change profile picture"
          >
            <Avatar
              uri={user?.profileImage || ''}
              name={user?.name || 'User'}
              size={68}
              isOnline={true}
            />
            <View style={styles.cameraBadge}>
              <Camera size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileDetails}>
            <Text style={styles.name}>{user?.name || 'My Profile'}</Text>
            <View style={styles.infoRow}>
              <Mail size={12} color={COLORS.textMuted} />
              <Text style={styles.email}>{user?.email || 'No email registered'}</Text>
            </View>
            {Boolean(user?.phone) && (
              <View style={styles.infoRow}>
                <Phone size={12} color={COLORS.textMuted} />
                <Text style={styles.phone}>{user?.phone}</Text>
              </View>
            )}
            <View style={styles.roleActionRow}>
              <View style={styles.roleChip}>
                <Text style={styles.roleText}>
                  {user?.role ? user.role.toUpperCase() : 'CUSTOMER'}
                </Text>
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

        {/* Menu Section */}
        <View style={styles.menuGroup}>
          {menuItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                style={[
                  styles.menuItem,
                  idx < menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuIconContainer}>
                  <IconComp size={18} color={COLORS.primary} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <LogOut size={18} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.keyIconCircle}>
                  <KeyRound size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Change Password</Text>
                  <Text style={styles.modalSubtitle}>Update your account security</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
              <Input
                label="Current Password"
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                prefixIcon={<Lock size={16} color={COLORS.textMuted} />}
                suffixIcon={
                  <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                    {showCurrent ? (
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
                secureTextEntry={!showNew}
                prefixIcon={<Lock size={16} color={COLORS.textMuted} />}
                suffixIcon={
                  <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                    {showNew ? (
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
                secureTextEntry={!showConfirm}
                prefixIcon={<Lock size={16} color={COLORS.textMuted} />}
                suffixIcon={
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? (
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
                loading={loadingPassword}
                onPress={handleChangePassword}
                icon={<CheckCircle2 size={18} color="#FFFFFF" />}
                style={{ marginTop: 8 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Photo Picker Modal */}
      <PhotoPickerModal
        visible={showPhotoModal}
        currentImage={user?.profileImage}
        title="Profile Photo"
        subtitle="Upload a picture or keep the default icon"
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
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
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    fontWeight: '700',
    color: COLORS.primary,
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
  menuGroup: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  keyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
});
