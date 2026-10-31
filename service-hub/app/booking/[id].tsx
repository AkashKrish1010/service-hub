import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BookingStatusTimeline } from '../../components/booking/BookingStatusTimeline';
import { bookingService } from '../../services/booking.service';
import { useAuth } from '../../store/authStore';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  Star,
  CheckCircle,
  Camera,
  AlertCircle,
} from 'lucide-react-native';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';
import { CompleteJobModal } from '../../components/booking/CompleteJobModal';

export default function BookingDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const data = await bookingService.getById(id!);
      setBooking(data);
    } catch (e) {
      console.warn('Error fetching booking detail', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await bookingService.updateStatus(id!, status);
      setAlertConfig({
        visible: true,
        title: 'Status Updated',
        message: `Booking has been successfully updated to ${status.toUpperCase()}.`,
        type: 'success',
      });
      fetchBooking();
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Update Error',
        message: 'Failed to update booking status. Please try again.',
        type: 'error',
      });
    }
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Booking Details</Text>
        </View>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: COLORS.textMuted }}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCustomer = user?.role === 'customer';
  const isProvider = user?.role === 'provider';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
          <ArrowLeft size={18} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Booking Details</Text>
        <Badge status={booking.status} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Visual Step Progress Timeline */}
        <Card style={styles.timelineCard}>
          <Text style={styles.sectionHeading}>Progress Timeline</Text>
          <BookingStatusTimeline status={booking.status} />
        </Card>

        {/* Parties Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionHeading}>Service Details</Text>
          <Text style={styles.categoryTitle}>{booking.categoryName || 'Home Repair'}</Text>
          <Text style={styles.problemDesc}>{booking.description}</Text>

          <View style={styles.infoRow}>
            <Calendar size={14} color={COLORS.primary} />
            <Text style={styles.infoText}>{booking.scheduledDate}</Text>
            <Clock size={14} color={COLORS.primary} style={{ marginLeft: 12 }} />
            <Text style={styles.infoText}>{booking.scheduledTime}</Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={14} color={COLORS.primary} />
            <Text style={styles.infoText}>{booking.serviceAddress}</Text>
          </View>
        </Card>

        {/* Counterparty Information */}
        <Card style={styles.card}>
          <Text style={styles.sectionHeading}>
            {isProvider ? 'Customer Information' : 'Assigned Technician'}
          </Text>
          <Text style={styles.partyName}>
            {isProvider
              ? booking.customerId?.name || 'Customer'
              : booking.providerId?.name || 'Verified Technician'}
          </Text>
          <Text style={styles.partyEmail}>
            {isProvider
              ? booking.customerId?.email || 'Registered Customer'
              : booking.providerId?.email || 'Verified Service Pro'}
          </Text>
        </Card>

        {/* Payment & Receipt Summary */}
        <Card style={styles.card}>
          <View style={styles.receiptHeader}>
            <FileText size={16} color={COLORS.primary} />
            <Text style={styles.sectionHeading}>Invoice Receipt</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptItem}>Base Service (1 hr)</Text>
            <Text style={styles.receiptVal}>${(booking.totalAmount - 6).toFixed(2)}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptItem}>Platform Trust Fee</Text>
            <Text style={styles.receiptVal}>$2.00</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptItem}>Service Tax (EST)</Text>
            <Text style={styles.receiptVal}>$4.00</Text>
          </View>

          <View style={styles.receiptTotalRow}>
            <Text style={styles.receiptTotalLabel}>Total Amount</Text>
            <Text style={styles.receiptTotalVal}>${booking.totalAmount.toFixed(2)}</Text>
          </View>

          <Text style={styles.paymentMethodText}>
            Payment: {booking.paymentMethod.toUpperCase()} ({booking.paymentStatus.toUpperCase()})
          </Text>
        </Card>

        {/* Completion Proof Card */}
        {booking.completionProof && (booking.completionProof.photoUrl || booking.completionProof.reason) ? (
          <Card style={styles.card}>
            <View style={styles.receiptHeader}>
              <CheckCircle size={16} color={COLORS.success} />
              <Text style={styles.sectionHeading}>Proof of Work Completed</Text>
            </View>
            {booking.completionProof.photoUrl ? (
              <View style={{ marginTop: 8 }}>
                <Image
                  source={{ uri: booking.completionProof.photoUrl }}
                  style={{ width: '100%', height: 180, borderRadius: RADIUS.md }}
                  resizeMode="cover"
                />
                <Text style={{ fontSize: 11, color: COLORS.success, fontWeight: '700', marginTop: 6 }}>
                  Verified Photo Proof Attached
                </Text>
              </View>
            ) : null}
            {booking.completionProof.reason ? (
              <View style={{ marginTop: 8, backgroundColor: '#FFFBEB', padding: 10, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: '#FDE68A' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400E' }}>No Photo Stated Reason:</Text>
                <Text style={{ fontSize: 12, color: COLORS.textMain, marginTop: 4 }}>
                  {booking.completionProof.reason}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {/* Customer Actions */}
        {isCustomer && booking.status === 'completed' && (
          <Button
            title="Leave a Review"
            variant="accent"
            size="lg"
            onPress={() =>
              router.push({
                pathname: '/review/[bookingId]',
                params: {
                  bookingId: booking._id,
                  providerId:
                    typeof booking.providerId === 'object'
                      ? booking.providerId?._id
                      : booking.providerId,
                },
              })
            }
            icon={<Star size={16} color="#FFFFFF" />}
            style={{ marginBottom: 12 }}
          />
        )}

        {isCustomer && (
          <Button
            title="Raise a Complaint"
            variant="outline"
            size="md"
            onPress={() =>
              router.push({
                pathname: '/complaint/new',
                params: { bookingId: booking._id },
              })
            }
            icon={<AlertTriangle size={15} color={COLORS.error} />}
            textStyle={{ color: COLORS.error }}
            style={{ borderColor: '#FECACA' }}
          />
        )}

        {/* Provider Lifecycle Actions */}
        {isProvider && booking.status === 'pending' && (
          <View style={styles.providerActionRow}>
            <Button
              title="Reject"
              variant="outline"
              size="md"
              onPress={() => handleUpdateStatus('cancelled')}
              style={{ flex: 1, marginRight: 8, borderColor: COLORS.error }}
              textStyle={{ color: COLORS.error }}
            />
            <Button
              title="Accept Booking"
              variant="primary"
              size="md"
              onPress={() => handleUpdateStatus('accepted')}
              style={{ flex: 1.5 }}
            />
          </View>
        )}

        {isProvider && booking.status === 'accepted' && (
          <Button
            title="Start Service"
            variant="primary"
            size="lg"
            onPress={() => handleUpdateStatus('ongoing')}
            style={{ marginTop: 8 }}
          />
        )}

        {isProvider && (booking.status === 'ongoing' || booking.status === 'accepted') && (
          <Button
            title="Mark as Completed"
            variant="accent"
            size="lg"
            onPress={() => setShowCompleteModal(true)}
            icon={<CheckCircle size={16} color="#FFFFFF" />}
            style={{ marginTop: 8 }}
          />
        )}
      </ScrollView>

      {/* Complete Job Verification Modal */}
      <CompleteJobModal
        visible={showCompleteModal}
        bookingId={booking._id}
        bookingTitle={booking.description}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={async (proof) => {
          try {
            await bookingService.updateStatus(id!, 'completed', proof);
            setAlertConfig({
              visible: true,
              title: 'Job Completed',
              message: 'The booking has been successfully completed with verification proof.',
              type: 'success',
            });
            fetchBooking();
          } catch (e) {
            setAlertConfig({
              visible: true,
              title: 'Update Error',
              message: 'Failed to update booking status. Please try again.',
              type: 'error',
            });
          }
        }}
      />

      {/* Themed Feedback Pop-up Modal */}
      <ThemedAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  scroll: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 14,
    paddingBottom: 40,
  },
  timelineCard: {
    padding: 16,
    marginBottom: 12,
  },
  card: {
    padding: 16,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  problemDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  partyName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  partyEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  receiptItem: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  receiptVal: {
    fontSize: 12,
    color: COLORS.textMain,
    fontWeight: '500',
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  receiptTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  receiptTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  paymentMethodText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  providerActionRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
