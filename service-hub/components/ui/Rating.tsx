import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

interface RatingProps {
  score: number;
  reviewsCount?: number;
  size?: number;
  showReviews?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  score,
  reviewsCount,
  size = 14,
  showReviews = true,
}) => {
  const numericScore = typeof score === 'number' ? score : Number(score || 0);
  const isNew = numericScore === 0 && (!reviewsCount || reviewsCount === 0);

  return (
    <View style={styles.container}>
      <Star
        size={size}
        color="#FBBF24"
        fill={isNew ? 'none' : '#FBBF24'}
      />
      <Text style={[styles.score, { fontSize: size }]}>
        {isNew ? '0.0' : numericScore.toFixed(1)}
      </Text>
      {showReviews && (
        <Text style={[styles.reviews, { fontSize: size - 1 }]}>
          {isNew ? '(New)' : `(${reviewsCount || 0} reviews)`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontWeight: '700',
    color: COLORS.textMain,
    marginLeft: 4,
  },
  reviews: {
    color: COLORS.textMuted,
    marginLeft: 4,
  },
});
