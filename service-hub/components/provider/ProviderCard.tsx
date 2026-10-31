import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Rating } from '../ui/Rating';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { COLORS, RADIUS } from '../../constants/theme';
import { MapPin, ShieldCheck, Zap } from 'lucide-react-native';

interface ProviderCardProps {
  provider: {
    _id?: string;
    userId?: {
      _id: string;
      name: string;
      profileImage?: string;
      isVerified?: boolean;
    };
    category: string;
    hourlyRate: number;
    averageRating: number;
    totalReviews: number;
    distance?: string;
    location?: { address?: string };
  };
  onPress: () => void;
  onBookNow: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onPress,
  onBookNow,
}) => {
  const name = provider.userId ? provider.userId.name : 'Verified Provider';
  const profileImage = provider.userId ? provider.userId.profileImage : undefined;
  const isVerified = provider.userId ? provider.userId.isVerified : true;

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <Avatar uri={profileImage} name={name} size={52} isOnline={true} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            {isVerified && (
              <ShieldCheck size={16} color={COLORS.primary} style={styles.checkIcon} />
            )}
          </View>
          <Text style={styles.category}>{provider.category}</Text>
          <View style={styles.metaRow}>
            <Rating
              score={provider.averageRating || 4.8}
              reviewsCount={provider.totalReviews || 0}
              size={12}
            />
            {provider.distance ? (
              <View style={styles.distanceBadge}>
                <MapPin size={11} color={COLORS.textMuted} />
                <Text style={styles.distanceText}>{provider.distance}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.price}>
            ${provider.hourlyRate}
            <Text style={styles.priceUnit}>/hr</Text>
          </Text>
        </View>
        <Button
          title="Book Now"
          variant="accent"
          size="sm"
          onPress={onBookNow}
          icon={<Zap size={14} color="#FFFFFF" />}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    flexShrink: 1,
  },
  checkIcon: {
    marginLeft: 4,
  },
  category: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
});
