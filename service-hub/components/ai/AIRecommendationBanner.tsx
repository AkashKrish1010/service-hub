import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, Zap } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { COLORS, RADIUS } from '../../constants/theme';

interface AIRecommendationBannerProps {
  title?: string;
  reason?: string;
  providerName?: string;
  rating?: number;
  distance?: string;
  onQuickBook: () => void;
}

export const AIRecommendationBanner: React.FC<AIRecommendationBannerProps> = ({
  title = 'Need quick emergency repairs?',
  reason = 'Kumar Plumbing is nearby with 4.8 stars. Ready for immediate dispatch.',
  onQuickBook,
}) => {
  return (
    <View style={styles.banner}>
      <View style={styles.header}>
        <View style={styles.badgeWrapper}>
          <Sparkles size={13} color={COLORS.primary} />
          <Badge status="ai_match" label="AI MATCH" />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.reason}>{reason}</Text>

      <View style={styles.buttonWrapper}>
        <Button
          title="Quick Book"
          variant="accent"
          size="sm"
          onPress={onQuickBook}
          icon={<Zap size={14} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  reason: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  buttonWrapper: {
    alignSelf: 'flex-start',
  },
});
