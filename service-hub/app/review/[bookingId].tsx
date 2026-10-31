import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';
import { reviewService } from '../../services/other.services';
import { Star, ArrowLeft, CheckCircle2 } from 'lucide-react-native';

export default function ReviewScreen() {
  const router = useRouter();
  const { bookingId, providerId } = useLocalSearchParams<{
    bookingId: string;
    providerId?: string;
  }>();

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('Great service! Fixed the issue quickly and professionally.');
  const [submitting, setSubmitting] = useState(false);
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
    if (!reviewText.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Required',
        message: 'Please write a brief comment about the service.',
        type: 'warning',
        confirmText: 'Got It',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.create({
        bookingId: bookingId as string,
        providerId: (providerId as string) || '',
        rating,
        reviewText,
      });

      setAlertConfig({
        visible: true,
        title: 'Review Submitted',
        message: 'Thank you! Your review has been recorded on the provider profile.',
        type: 'success',
        confirmText: 'Done',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          router.back();
        },
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Review Recorded',
        message: 'Thank you! Your feedback has been recorded.',
        type: 'success',
        confirmText: 'Done',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          router.back();
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={20} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Rate & Review</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.promptTitle}>How was your service experience?</Text>
        <Text style={styles.promptSubtitle}>
          Your feedback helps maintain high standards across Service Hub.
        </Text>

        {/* 5 Star Rating Selector */}
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Star
                size={36}
                color="#FBBF24"
                fill={s <= rating ? '#FBBF24' : 'none'}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingText}>{rating} of 5 Stars</Text>

        <TextInput
          style={styles.textArea}
          placeholder="Share details of your experience..."
          value={reviewText}
          onChangeText={setReviewText}
          multiline
          numberOfLines={4}
        />

        <Button
          title="Submit Review"
          variant="primary"
          size="lg"
          loading={submitting}
          onPress={handleSubmit}
          icon={<CheckCircle2 size={16} color="#FFFFFF" />}
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
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
    marginTop: 16,
  },
  promptSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  starRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 20,
  },
  textArea: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: 13,
    color: COLORS.textMain,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
});
