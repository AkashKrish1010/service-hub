import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { COLORS } from '../../constants/theme';
import { Calendar, Clock, MapPin } from 'lucide-react-native';

interface BookingCardProps {
  booking: {
    _id: string;
    categoryName?: string;
    description: string;
    scheduledDate: string;
    scheduledTime: string;
    serviceAddress: string;
    status: string;
    totalAmount: number;
    providerId?: { name: string; profileImage?: string };
    customerId?: { name: string; profileImage?: string };
  };
  userRole?: 'customer' | 'provider' | 'admin';
  onPress: () => void;
  onAction?: (action: string) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  userRole = 'customer',
  onPress,
  onAction,
}) => {
  const otherParty =
    userRole === 'provider'
      ? booking.customerId?.name || 'Customer'
      : booking.providerId?.name || 'Service Provider';

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.category}>{booking.categoryName || 'Service'}</Text>
          <Text style={styles.otherParty}>{otherParty}</Text>
        </View>
        <Badge status={booking.status} />
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {booking.description}
      </Text>

      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Calendar size={13} color={COLORS.textMuted} />
          <Text style={styles.detailText}>{booking.scheduledDate}</Text>
          <Clock size={13} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
          <Text style={styles.detailText}>{booking.scheduledTime}</Text>
        </View>
        <View style={[styles.detailRow, { marginTop: 4 }]}>
          <MapPin size={13} color={COLORS.textMuted} />
          <Text style={styles.detailText} numberOfLines={1}>
            {booking.serviceAddress}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>${booking.totalAmount.toFixed(2)}</Text>

        {userRole === 'provider' && booking.status === 'pending' && onAction && (
          <View style={styles.actionGroup}>
            <Button
              title="Reject"
              variant="outline"
              size="sm"
              onPress={() => onAction('reject')}
              style={styles.actionBtn}
            />
            <Button
              title="Accept"
              variant="primary"
              size="sm"
              onPress={() => onAction('accept')}
              style={styles.actionBtn}
            />
          </View>
        )}

        {userRole === 'provider' && booking.status === 'ongoing' && onAction && (
          <Button
            title="Mark Completed"
            variant="accent"
            size="sm"
            onPress={() => onAction('complete')}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  otherParty: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  detailsBox: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textMain,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    minWidth: 70,
  },
});
