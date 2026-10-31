import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Button } from '../ui/Button';
import {
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  Trash2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface CompleteJobModalProps {
  visible: boolean;
  bookingId: string;
  bookingTitle?: string;
  onClose: () => void;
  onConfirm: (proof: { completionPhoto?: string; completionReason?: string }) => Promise<void> | void;
}

export const CompleteJobModal: React.FC<CompleteJobModalProps> = ({
  visible,
  bookingId,
  bookingTitle,
  onClose,
  onConfirm,
}) => {
  const [photoUri, setPhotoUri] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!visible) return null;

  const handlePickFromLibrary = async () => {
    setErrorMessage('');
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage('Gallery permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
        setReason('');
      }
    } catch (e) {
      console.warn('Error launching image library', e);
      setErrorMessage('Could not open photo library.');
    }
  };

  const handleTakePhoto = async () => {
    setErrorMessage('');
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage('Camera permission is required to capture photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
        setReason('');
      }
    } catch (e) {
      console.warn('Error launching camera', e);
      setErrorMessage('Could not open camera.');
    }
  };

  const handleUseSamplePhoto = () => {
    setPhotoUri(
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'
    );
    setReason('');
    setErrorMessage('');
  };

  const handleRemovePhoto = () => {
    setPhotoUri('');
  };

  const handleSubmit = async () => {
    setErrorMessage('');

    // Rule: Must have photo OR must provide a reason why
    if (!photoUri && !reason.trim()) {
      setErrorMessage(
        'Please upload a photo of the completed repair or specify the reason why no photo was taken.'
      );
      return;
    }

    if (!photoUri && reason.trim().length < 5) {
      setErrorMessage('Please provide a detailed reason (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm({
        completionPhoto: photoUri || undefined,
        completionReason: photoUri ? undefined : reason.trim(),
      });
      // reset state
      setPhotoUri('');
      setReason('');
      onClose();
    } catch (e) {
      setErrorMessage('Failed to submit completion verification.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setPhotoUri('');
      setReason('');
      setErrorMessage('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <CheckCircle2 size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Mark Job as Completed</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {bookingTitle || 'Verification & Quality Proof'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionPrompt}>
              Upload a photo showing the completed repair or fix:
            </Text>

            {/* Photo Preview or Selection */}
            {photoUri ? (
              <View style={styles.previewCard}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
                <View style={styles.previewInfo}>
                  <View style={styles.verifiedRow}>
                    <CheckCircle2 size={15} color={COLORS.success} />
                    <Text style={styles.verifiedText}>Completion Photo Attached</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={handleRemovePhoto}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={14} color={COLORS.error} />
                    <Text style={styles.removeText}>Remove & Choose Another</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.pickerStack}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={handleTakePhoto}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.btnIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <Camera size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.btnLabel}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={handlePickFromLibrary}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.btnIconBox, { backgroundColor: '#F0FDF4' }]}>
                      <ImageIcon size={18} color={COLORS.success} />
                    </View>
                    <Text style={styles.btnLabel}>From Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={handleUseSamplePhoto}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.btnIconBox, { backgroundColor: '#FAF5FF' }]}>
                      <Sparkles size={18} color="#9333EA" />
                    </View>
                    <Text style={styles.btnLabel}>Sample Photo</Text>
                  </TouchableOpacity>
                </View>

                {/* If no photo: Reason input */}
                <View style={styles.reasonContainer}>
                  <View style={styles.reasonHeader}>
                    <AlertCircle size={14} color={COLORS.warning} />
                    <Text style={styles.reasonTitle}>
                      No photo available? Reason required:
                    </Text>
                  </View>
                  <TextInput
                    style={styles.reasonInput}
                    placeholder="e.g. Customer requested privacy, internal pipe work, diagnostic inspection only..."
                    placeholderTextColor={COLORS.textMuted}
                    value={reason}
                    onChangeText={(val) => {
                      setReason(val);
                      if (errorMessage) setErrorMessage('');
                    }}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            )}

            {/* Error Message Notice */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <AlertCircle size={14} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.policyNotice}>
              <Text style={styles.policyText}>
                Quality photos or recorded justifications protect both you and the customer during dispute resolutions.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Button
              title="Cancel"
              variant="outline"
              size="md"
              onPress={handleClose}
              disabled={submitting}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Confirm Completion"
              variant="accent"
              size="md"
              loading={submitting}
              onPress={handleSubmit}
              icon={<CheckCircle2 size={16} color="#FFFFFF" />}
              style={{ flex: 1.6 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 13, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.screenPadding,
  },
  card: {
    width: Math.min(width - 32, 420),
    maxHeight: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: COLORS.background,
  },
  body: {
    marginTop: 14,
  },
  sectionPrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  pickerBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  btnLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  pickerStack: {
    marginBottom: 10,
  },
  previewCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: RADIUS.sm,
    backgroundColor: '#E5E7EB',
  },
  previewInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeText: {
    fontSize: 11,
    color: COLORS.error,
    fontWeight: '600',
  },
  reasonContainer: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 12,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  reasonTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  reasonInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: RADIUS.sm,
    padding: 10,
    fontSize: 12,
    color: COLORS.textMain,
    height: 64,
    textAlignVertical: 'top',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    flex: 1,
  },
  policyNotice: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: RADIUS.sm,
    marginBottom: 14,
  },
  policyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
