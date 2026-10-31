import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';
import { complaintService } from '../../services/other.services';
import { ArrowLeft, AlertTriangle, Send } from 'lucide-react-native';

export default function NewComplaint() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
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

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!subject.trim() || !description.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Required Fields',
        message: 'Please enter both subject and description.',
        type: 'warning',
        confirmText: 'Got It',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    setLoading(true);
    try {
      await complaintService.create({
        bookingId: bookingId || undefined,
        subject,
        description,
      });

      setAlertConfig({
        visible: true,
        title: 'Dispute Filed',
        message: 'Your dispute has been logged with the platform administrative team. You will be notified when reviewed.',
        type: 'success',
        confirmText: 'Return',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          router.back();
        },
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Submission Error',
        message: 'Failed to submit complaint. Please check your network connection.',
        type: 'error',
        confirmText: 'Dismiss',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={20} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Raise a Dispute</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoBanner}>
          <AlertTriangle size={18} color={COLORS.error} />
          <Text style={styles.infoText}>
            Our dispute resolution team will review your report against technician notes within 24 hours.
          </Text>
        </View>

        <Input
          label="Subject of Complaint"
          placeholder="e.g. Technician arrived 2 hours late / incomplete repair"
          value={subject}
          onChangeText={setSubject}
        />

        <Input
          label="Detailed Description"
          placeholder="Please describe exactly what occurred..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          style={{ height: 100, textAlignVertical: 'top' }}
        />

        <Button
          title="Submit Ticket to Admin"
          variant="danger"
          size="lg"
          loading={loading}
          onPress={handleSubmit}
          icon={<Send size={16} color="#FFFFFF" />}
          style={{ marginTop: 12 }}
        />
      </View>

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
    backgroundColor: COLORS.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  content: {
    padding: SPACING.screenPadding,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.md,
    padding: 12,
    gap: 10,
    marginBottom: 20,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.error,
    lineHeight: 17,
  },
});
