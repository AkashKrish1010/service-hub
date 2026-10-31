import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Button } from '../ui/Button';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface BookingConfirmedModalProps {
  visible: boolean;
  bookingData: {
    bookingId?: string;
    providerName?: string;
    categoryName?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    serviceAddress?: string;
    totalAmount?: number;
    paymentMethod?: 'online' | 'cash';
  } | null;
  onViewBooking: () => void;
  onGoToBookings: () => void;
  onClose: () => void;
}

export const BookingConfirmedModal: React.FC<BookingConfirmedModalProps> = ({
  visible,
  bookingData,
  onViewBooking,
  onGoToBookings,
  onClose,
}) => {
  if (!bookingData) return null;

  const total = bookingData.totalAmount || 40.0;
  const isOnline = bookingData.paymentMethod === 'online';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Celebration Badge */}
          <View style={styles.badgeWrapper}>
            <View style={styles.outerGlow}>
              <View style={styles.innerBadge}>
                <CheckCircle2 size={36} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your service request has been successfully assigned and scheduled.
          </Text>

          {/* Ticket Summary Box */}
          <View style={styles.ticketBox}>
            {/* Provider & Category */}
            <View style={styles.ticketRowHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ticketCategory}>
                  {bookingData.categoryName || 'Home Service'}
                </Text>
                <View style={styles.providerRow}>
                  <ShieldCheck size={14} color={COLORS.primary} />
                  <Text style={styles.providerName} numberOfLines={1}>
                    {bookingData.providerName || 'Verified Technician'}
                  </Text>
                </View>
              </View>
              <View style={styles.pricePill}>
                <Text style={styles.priceText}>${total.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Date & Time */}
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Calendar size={13} color={COLORS.primary} />
                <Text style={styles.detailText}>{bookingData.scheduledDate || 'Scheduled'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Clock size={13} color={COLORS.primary} />
                <Text style={styles.detailText}>{bookingData.scheduledTime || 'Selected Time'}</Text>
              </View>
            </View>

            {/* Address */}
            {bookingData.serviceAddress ? (
              <View style={styles.addressRow}>
                <MapPin size={13} color={COLORS.primary} style={{ marginTop: 2 }} />
                <Text style={styles.addressText} numberOfLines={2}>
                  {bookingData.serviceAddress}
                </Text>
              </View>
            ) : null}

            {/* Payment Method */}
            <View style={styles.paymentPillRow}>
              <View style={styles.paymentPill}>
                {isOnline ? (
                  <CreditCard size={12} color={COLORS.primary} />
                ) : (
                  <Banknote size={12} color={COLORS.success} />
                )}
                <Text style={styles.paymentText}>
                  {isOnline ? 'Payment: Online' : 'Payment: Cash after service'}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Sparkles size={11} color={COLORS.primary} />
                <Text style={styles.statusText}>Active Dispatch</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="View Booking Details"
              variant="primary"
              size="lg"
              onPress={onViewBooking}
              icon={<ArrowRight size={16} color="#FFFFFF" />}
              style={{ width: '100%', marginBottom: 10 }}
            />
            <Button
              title="Return to My Bookings"
              variant="outline"
              size="md"
              onPress={onGoToBookings}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 13, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.screenPadding,
  },
  modalCard: {
    width: Math.min(width - 32, 420),
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  badgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  outerGlow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  ticketBox: {
    width: '100%',
    backgroundColor: '#F8FAFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 16,
    marginBottom: 20,
  },
  ticketRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ticketCategory: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  providerName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  pricePill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  paymentPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  paymentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actions: {
    width: '100%',
  },
});
