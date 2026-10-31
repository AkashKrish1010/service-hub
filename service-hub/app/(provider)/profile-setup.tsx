import React, { useState, useEffect } from 'react';
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
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LocationPicker } from '../../components/maps/LocationPicker';
import { Avatar } from '../../components/ui/Avatar';
import { Rating } from '../../components/ui/Rating';
import { PhotoPickerModal } from '../../components/ui/PhotoPickerModal';
import { providerService } from '../../services/provider.service';
import { reviewService } from '../../services/other.services';
import { useAuth } from '../../store/authStore';
import {
  MapPin,
  DollarSign,
  Briefcase,
  Award,
  CheckCircle,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  Camera,
  Trash2,
  Star,
  LogOut,
} from 'lucide-react-native';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';
import { TopNavbar } from '../../components/common/TopNavbar';

export default function ProfileSetup() {
  const router = useRouter();
  const { user, logout, updatePassword, updateProfile } = useAuth();
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [category, setCategory] = useState('General Services');
  const [hourlyRate, setHourlyRate] = useState('40');
  const [experience, setExperience] = useState('1+ years');
  const [bio, setBio] = useState('Professional service technician providing high quality repairs.');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 40.748817,
    lng: -73.985130,
  });

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleLogout = () => {
    setAlertConfig({
      visible: true,
      title: 'Sign Out',
      message: 'Are you sure you want to end your active provider session on this device?',
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

  const handleChangePassword = async () => {
    Keyboard.dismiss();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setAlertConfig({
        visible: true,
        title: 'Required Fields',
        message: 'Please fill in all password fields.',
        type: 'warning',
      });
      return;
    }

    if (newPassword.length < 6) {
      setAlertConfig({
        visible: true,
        title: 'Invalid Password',
        message: 'New password must be at least 6 characters long.',
        type: 'warning',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertConfig({
        visible: true,
        title: 'Password Mismatch',
        message: 'New password and confirm password do not match.',
        type: 'warning',
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
        message: 'Your provider password has been updated successfully. Your new password is now active.',
        type: 'success',
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
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handlePhotoSelect = async (imageUri: string) => {
    setProfileImage(imageUri);
    try {
      await updateProfile({ profileImage: imageUri });
      await providerService.updateProfile({ profileImage: imageUri });
      setAlertConfig({
        visible: true,
        title: 'Profile Picture Saved',
        message: 'Your provider profile photo has been updated successfully.',
        type: 'success',
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Save Failed',
        message: 'Failed to update profile photo.',
        type: 'error',
      });
    }
  };

  const handlePhotoRemove = async () => {
    setProfileImage('');
    try {
      await updateProfile({ profileImage: '' });
      await providerService.updateProfile({ profileImage: '' });
      setAlertConfig({
        visible: true,
        title: 'Photo Removed',
        message: 'Reverted to default brand icon.',
        type: 'info',
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Removal Failed',
        message: 'Failed to remove profile photo.',
        type: 'error',
      });
    }
  };

  useEffect(() => {
    fetchCurrentProfile();
  }, []);

  const fetchCurrentProfile = async () => {
    if (!user) return;
    if (user.profileImage) {
      setProfileImage(user.profileImage);
    }
    try {
      const [data, revs] = await Promise.all([
        providerService.getProfile(user.id),
        reviewService.getByProvider(user.id).catch(() => []),
      ]);
      if (data) {
        if (data.category) setCategory(data.category);
        if (data.hourlyRate) setHourlyRate(data.hourlyRate.toString());
        if (data.experience) setExperience(data.experience);
        if (data.bio) setBio(data.bio);
        if (data.location?.address) setAddress(data.location.address);
        if (data.location?.coordinates) {
          setLocation({
            lng: data.location.coordinates[0],
            lat: data.location.coordinates[1],
          });
        }
      }
      if (revs) setReviews(revs);
    } catch (e) {
      console.warn('Could not load provider profile', e);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await providerService.updateProfile({
        category,
        hourlyRate: Number(hourlyRate),
        experience,
        bio,
        profileImage,
      });
      await updateProfile({ profileImage });
      setAlertConfig({
        visible: true,
        title: 'Profile Updated',
        message: 'Your provider profile rates, details, and picture have been saved successfully.',
        type: 'success',
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Save Failed',
        message: 'Failed to update profile details. Please try again.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmLocation = async (newLoc: { lat: number; lng: number; address: string }) => {
    try {
      await providerService.saveLocation(newLoc);
      setLocation({ lat: newLoc.lat, lng: newLoc.lng });
      setAddress(newLoc.address);
      setShowLocationPicker(false);
      setAlertConfig({
        visible: true,
        title: 'Location Pinned',
        message: 'Your service area location pin has been updated on the map.',
        type: 'success',
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Location Error',
        message: 'Failed to save location coordinates.',
        type: 'error',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNavbar subtitle="Provider Console" showSearch={false} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Provider Profile Setup</Text>
          <Text style={styles.subtitle}>Configure your rates, service category, and GPS area</Text>
        </View>

        {/* Provider Profile Picture Card */}
        <View style={styles.photoCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.8}
            accessibilityLabel="Upload provider photo"
          >
            <Avatar
              uri={profileImage || user?.profileImage || ''}
              name={user?.name || 'Provider'}
              size={76}
            />
            <View style={styles.cameraBadge}>
              <Camera size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.photoInfo}>
            <Text style={styles.providerAccountName}>{user?.name || 'Provider Profile'}</Text>
            <Text style={styles.photoTitle}>Provider Profile Picture</Text>
            <Text style={styles.photoSubtitle}>
              Shown to customers on service listings, search results, and bookings.
            </Text>
            <View style={styles.photoBtnRow}>
              <Button
                title={profileImage || user?.profileImage ? 'Change Photo' : 'Upload Photo'}
                variant="outline"
                size="sm"
                onPress={() => setShowPhotoModal(true)}
                icon={<Camera size={13} color={COLORS.primary} />}
              />
              {Boolean(profileImage || user?.profileImage) && (
                <Button
                  title="Remove"
                  variant="outline"
                  size="sm"
                  onPress={handlePhotoRemove}
                  style={{ borderColor: COLORS.error, marginLeft: 8 }}
                  textStyle={{ color: COLORS.error }}
                  icon={<Trash2 size={13} color={COLORS.error} />}
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Input
            label="Service Category"
            placeholder="e.g. Plumbing, Electrical, Cleaning"
            value={category}
            onChangeText={setCategory}
            prefixIcon={<Briefcase size={16} color={COLORS.textMuted} />}
          />

          <Input
            label="Hourly Rate ($ USD)"
            placeholder="40"
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
            prefixIcon={<DollarSign size={16} color={COLORS.textMuted} />}
          />

          <Input
            label="Years of Experience"
            placeholder="e.g. 5+ years"
            value={experience}
            onChangeText={setExperience}
            prefixIcon={<Award size={16} color={COLORS.textMuted} />}
          />

          <Input
            label="Professional Bio"
            placeholder="Tell customers about your skills and certifications..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            style={{ height: 80, textAlignVertical: 'top' }}
          />

          {/* Service Location Map Pin Trigger */}
          <View style={styles.locationSection}>
            <Text style={styles.locationLabel}>Service Area & Map Pin</Text>
            <View style={styles.locationBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressText}>{address}</Text>
                <Text style={styles.coordsText}>
                  Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </Text>
              </View>
              <Button
                title="Change Pin"
                variant="outline"
                size="sm"
                onPress={() => setShowLocationPicker(true)}
                icon={<MapPin size={13} color={COLORS.primary} />}
              />
            </View>
          </View>

          <Button
            title="Save Profile Setup"
            variant="primary"
            size="lg"
            loading={saving}
            onPress={handleSaveProfile}
            icon={<CheckCircle size={18} color="#FFFFFF" />}
            style={{ marginTop: 24 }}
          />
        </View>

        {/* Customer Reviews Section */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <View style={styles.reviewsCardHeader}>
            <View style={styles.reviewsIconBox}>
              <Star size={18} color="#D97706" fill="#FBBF24" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>Customer Reviews ({reviews.length})</Text>
              <Text style={styles.securitySubtitle}>
                Verified ratings and customer feedback
              </Text>
            </View>
          </View>

          {reviews.length === 0 ? (
            <View style={styles.emptyReviewBox}>
              <Text style={styles.emptyReviewText}>
                No reviews received yet. Completed bookings with customer ratings will appear here.
              </Text>
            </View>
          ) : (
            reviews.map((rev: any) => (
              <View key={rev._id} style={styles.providerReviewItem}>
                <View style={styles.providerReviewTop}>
                  <Avatar
                    uri={rev.customerId?.profileImage}
                    name={rev.customerId?.name || 'Customer'}
                    size={32}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.providerReviewerName}>
                      {rev.customerId?.name || 'Customer'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Rating score={rev.rating} size={11} showReviews={false} />
                      <Text style={styles.providerRatingScore}>{rev.rating}.0</Text>
                    </View>
                  </View>
                  <Text style={styles.providerReviewDate}>
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </Text>
                </View>
                <Text style={styles.providerReviewBody}>"{rev.reviewText}"</Text>
              </View>
            ))
          )}
        </View>

        {/* Security & Password Section */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <View style={styles.securityHeader}>
            <View style={styles.securityIconBox}>
              <KeyRound size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>Account Security</Text>
              <Text style={styles.securitySubtitle}>
                Update your account password
              </Text>
            </View>
          </View>
          <Button
            title="Change Password"
            variant="outline"
            size="md"
            onPress={() => setShowPasswordModal(true)}
            icon={<Lock size={16} color={COLORS.primary} />}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Sign Out Section */}
        <View style={[styles.card, { marginTop: 16, marginBottom: 40 }]}>
          <View style={styles.securityHeader}>
            <View style={[styles.securityIconBox, { backgroundColor: '#FEE2E2' }]}>
              <LogOut size={20} color={COLORS.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>Session & Sign Out</Text>
              <Text style={styles.securitySubtitle}>
                End your active provider session on this device
              </Text>
            </View>
          </View>
          <Button
            title="Sign Out of Provider Console"
            variant="outline"
            size="md"
            onPress={handleLogout}
            icon={<LogOut size={16} color={COLORS.error} />}
            style={{ marginTop: 12, borderColor: '#FCA5A5' }}
            textStyle={{ color: COLORS.error, fontWeight: '700' }}
          />
        </View>
      </ScrollView>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <LocationPicker
            initialLocation={location}
            onConfirmLocation={handleConfirmLocation}
            onCancel={() => setShowLocationPicker(false)}
          />
        </SafeAreaView>
      </Modal>

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
                  <Text style={styles.modalSubtitle}>Update your provider login password</Text>
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
        currentImage={profileImage || user?.profileImage}
        title="Provider Profile Picture"
        subtitle="Upload a clear professional photo of yourself"
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
        onConfirm={alertConfig.onConfirm || (() => setAlertConfig((prev) => ({ ...prev, visible: false })))}
        onCancel={alertConfig.onCancel}
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
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoInfo: {
    flex: 1,
  },
  providerAccountName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  photoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  photoSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  photoBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationSection: {
    marginTop: 8,
  },
  locationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  coordsText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  securitySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
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
  reviewsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  reviewsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyReviewBox: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyReviewText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  providerReviewItem: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerReviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  providerReviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  providerRatingScore: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  providerReviewDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  providerReviewBody: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
});
