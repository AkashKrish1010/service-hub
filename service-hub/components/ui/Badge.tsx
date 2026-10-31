import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

interface BadgeProps {
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled' | 'verified' | 'ai_match' | string;
  label?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, style }) => {
  const getBadgeConfig = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706', defaultLabel: 'Pending' };
      case 'accepted':
        return { bg: '#DBEAFE', text: '#1A6BFF', defaultLabel: 'Accepted' };
      case 'ongoing':
        return { bg: '#E0E7FF', text: '#4338CA', defaultLabel: 'In Progress' };
      case 'completed':
        return { bg: '#DCFCE7', text: '#16A34A', defaultLabel: 'Completed' };
      case 'cancelled':
        return { bg: '#FEE2E2', text: '#DC2626', defaultLabel: 'Cancelled' };
      case 'verified':
        return { bg: '#E0F2FE', text: '#0284C7', defaultLabel: 'Verified' };
      case 'ai_match':
        return { bg: '#EFF6FF', text: '#1A6BFF', defaultLabel: 'AI MATCH' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', defaultLabel: status };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }]}>
        {label || config.defaultLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
