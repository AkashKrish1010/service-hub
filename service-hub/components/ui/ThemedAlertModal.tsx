import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Button } from './Button';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  Trash2,
  X,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface ThemedAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'destructive';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
}

export const ThemedAlertModal: React.FC<ThemedAlertModalProps> = ({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  // Dismiss soft keyboard whenever alert becomes visible so it never obscures the buttons
  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
    }
  }, [visible]);

  if (!visible) return null;

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else if (onConfirm) {
      onConfirm();
    }
  };

  const handleConfirmAction = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  };

  const displayConfirmText = confirmText && confirmText.trim().length > 0 ? confirmText : 'OK';
  const hasCancel = Boolean(cancelText && cancelText.trim().length > 0);

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
            <CheckCircle2 size={28} color={COLORS.success} />
          </View>
        );
      case 'error':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
            <AlertCircle size={28} color={COLORS.error} />
          </View>
        );
      case 'warning':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <AlertTriangle size={28} color={COLORS.warning} />
          </View>
        );
      case 'destructive':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
            <Trash2 size={28} color={COLORS.error} />
          </View>
        );
      case 'confirm':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <HelpCircle size={28} color={COLORS.primary} />
          </View>
        );
      default:
        return (
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Info size={28} color={COLORS.primary} />
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Top-Right Explicit Close 'X' Button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
                accessibilityLabel="Close dialog"
              >
                <X size={18} color={COLORS.textMuted} />
              </TouchableOpacity>

              {renderIcon()}

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonRow}>
                {hasCancel && (
                  <Button
                    title={cancelText!}
                    variant="outline"
                    size="md"
                    onPress={onCancel || handleClose}
                    style={styles.cancelBtn}
                  />
                )}
                <Button
                  title={displayConfirmText}
                  variant={isDestructive || type === 'destructive' ? 'accent' : 'primary'}
                  size="md"
                  onPress={handleConfirmAction}
                  style={hasCancel ? styles.confirmBtnWithCancel : styles.confirmBtnFull}
                  textStyle={{ fontWeight: '700' }}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 13, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.screenPadding,
  },
  modalCard: {
    position: 'relative',
    width: Math.min(width - 40, 380),
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtnWithCancel: {
    flex: 1.2,
  },
  confirmBtnFull: {
    flex: 1,
    width: '100%',
  },
});
