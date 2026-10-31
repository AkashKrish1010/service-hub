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
  return (
    <View style={styles.container}>
      <Star size={size} color="#FBBF24" fill="#FBBF24" />
      <Text style={[styles.score, { fontSize: size }]}>
        {score ? score.toFixed(1) : '5.0'}
      </Text>
      {showReviews && reviewsCount !== undefined && (
        <Text style={[styles.reviews, { fontSize: size - 1 }]}>
          ({reviewsCount} reviews)
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
