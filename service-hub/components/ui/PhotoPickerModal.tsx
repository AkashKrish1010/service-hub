import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Avatar } from './Avatar';
import { Button } from './Button';
import {
  Camera,
  Image as ImageIcon,
  Link,
  Trash2,
  X,
  Check,
  Sparkles,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface PhotoPickerModalProps {
  visible: boolean;
  currentImage?: string;
  title?: string;
  subtitle?: string;
  onSelectImage: (imageUri: string) => void;
  onRemoveImage?: () => void;
  onClose: () => void;
}

export const PhotoPickerModal: React.FC<PhotoPickerModalProps> = ({
  visible,
  currentImage,
  title = 'Profile Picture',
  subtitle = 'Choose a photo or keep the default icon',
  onSelectImage,
  onRemoveImage,
  onClose,
}) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!visible) return null;

  const handlePickFromLibrary = async () => {
    setErrorMsg('');
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setErrorMsg('Gallery permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        onSelectImage(result.assets[0].uri);
        onClose();
      }
    } catch (e) {
      console.warn('Error launching image library', e);
      setErrorMsg('Could not open photo library.');
    }
  };

  const handleTakePhoto = async () => {
    setErrorMsg('');
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        setErrorMsg('Camera permission is required to capture photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        onSelectImage(result.assets[0].uri);
        onClose();
      }
    } catch (e) {
      console.warn('Error launching camera', e);
      setErrorMsg('Could not launch camera.');
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlValue.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a valid image URL.');
      return;
    }
    onSelectImage(trimmed);
    setUrlValue('');
    setShowUrlInput(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Camera size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Current Avatar Preview */}
          <View style={styles.previewContainer}>
            <Avatar uri={currentImage} size={84} />
            <Text style={styles.previewCaption}>
              {currentImage ? 'Current Photo' : 'Default Icon Displayed'}
            </Text>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Action Options */}
          <View style={styles.actionsList}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handlePickFromLibrary}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
                <ImageIcon size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Choose from Photo Gallery</Text>
                <Text style={styles.actionDesc}>Pick an image from your device</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Camera size={20} color={COLORS.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Take a New Photo</Text>
                <Text style={styles.actionDesc}>Use device camera to snap a portrait</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => setShowUrlInput(!showUrlInput)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#F5F3FF' }]}>
                <Link size={20} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Use Web Image Link</Text>
                <Text style={styles.actionDesc}>Paste a direct image URL</Text>
              </View>
            </TouchableOpacity>

            {/* Inline URL Input */}
            {showUrlInput && (
              <View style={styles.urlInputBox}>
                <TextInput
                  style={styles.urlInput}
                  placeholder="https://example.com/photo.jpg"
                  placeholderTextColor={COLORS.textMuted}
                  value={urlValue}
                  onChangeText={setUrlValue}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <Button
                  title="Apply URL"
                  variant="primary"
                  size="sm"
                  onPress={handleApplyUrl}
                  style={{ marginTop: 8 }}
                  icon={<Check size={14} color="#FFFFFF" />}
                />
              </View>
            )}

            {/* Remove photo option if one is set */}
            {currentImage && onRemoveImage && (
              <TouchableOpacity
                style={[styles.actionItem, styles.removeActionItem]}
                onPress={() => {
                  onRemoveImage();
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                  <Trash2 size={20} color={COLORS.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionTitle, { color: COLORS.error }]}>
                    Remove Picture
                  </Text>
                  <Text style={styles.actionDesc}>Revert to default UI icon</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <Button
            title="Cancel"
            variant="outline"
            size="md"
            onPress={onClose}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
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
    width: Math.min(width - 32, 400),
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
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  previewCaption: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.sm,
    padding: 8,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
  },
  actionsList: {
    gap: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  removeActionItem: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  actionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  urlInputBox: {
    marginTop: 6,
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  urlInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: 10,
    fontSize: 12,
    color: COLORS.textMain,
  },
});
