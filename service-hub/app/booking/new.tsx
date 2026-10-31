import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../store/authStore';
import { bookingService } from '../../services/booking.service';
import { aiService } from '../../services/ai.service';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  CreditCard,
  Banknote,
  CheckCircle2,
} from 'lucide-react-native';
import { BookingConfirmedModal } from '../../components/booking/BookingConfirmedModal';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';

export default function NewBooking() {
  const router = useRouter();
  const { user } = useAuth();
  const { providerId, providerName, category, rate } = useLocalSearchParams<{
    providerId: string;
    providerName?: string;
    category?: string;
    rate?: string;
  }>();

  const dates = React.useMemo(() => {
    const list = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      list.push({
        label: i === 0 ? 'Today' : dayNames[d.getDay()],
        day: String(d.getDate()),
        full: `${yyyy}-${mm}-${dd}`,
      });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState(dates[0]?.full || new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('11:30 AM');
  const [address, setAddress] = useState(user?.address || '12 Cathedral Road, Chennai');
  const [description, setDescription] = useState('');
  const [aiRefined, setAiRefined] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('cash');
  const [submitting, setSubmitting] = useState(false);

  const [confirmedBookingData, setConfirmedBookingData] = useState<{
    bookingId?: string;
    providerName?: string;
    categoryName?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    serviceAddress?: string;
    totalAmount?: number;
    paymentMethod?: 'online' | 'cash';
  } | null>(null);
  const [showConfirmedModal, setShowConfirmedModal] = useState(false);

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

  const timeSlots = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'];

  const handleAiAssist = async () => {
    if (!description.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Problem Description',
        message: 'Please type a short description of the issue first.',
        type: 'warning',
      });
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await aiService.refineDescription(description);
      const refinedText = res?.refined || res?.refinedText || res?.data;
      if (refinedText) {
        setAiRefined(refinedText);
        setDescription(refinedText);
      }
    } catch (e) {
      const fallback = 'Professional inspection requested: Persistent utility issue requiring certified diagnostic assessment and standard repair.';
      setAiRefined(fallback);
      setDescription(fallback);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!providerId) {
      setAlertConfig({
        visible: true,
        title: 'Missing Provider',
        message: 'Provider identifier was not found. Please select a provider.',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      const total = Number(rate) || 40.0;
      const booking = await bookingService.create({
        providerId: providerId as string,
        categoryName: (category as string) || 'Plumbing',
        serviceAddress: address,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        description: aiRefined || description,
        paymentMethod,
        totalAmount: total,
      });

      setConfirmedBookingData({
        bookingId: booking._id,
        providerName: providerName || 'Verified Specialist',
        categoryName: (category as string) || 'Plumbing',
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        serviceAddress: address,
        totalAmount: total,
        paymentMethod,
      });
      setShowConfirmedModal(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit booking request.';
      setAlertConfig({
        visible: true,
        title: 'Booking Error',
        message: msg,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = Number(rate) || 40.0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
          <ArrowLeft size={18} color={COLORS.textMain} />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.topTitle}>Book Service</Text>
          <Text style={styles.topSubtitle}>Step 1 of 2: Service Details</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Provider Summary Card */}
        <Card style={styles.providerCard}>
          <Text style={styles.providerName}>{providerName || 'Kumar Plumbing Solutions'}</Text>
          <Text style={styles.providerCat}>{category || 'Plumbing'} • Starting at ${totalAmount}/hr</Text>
        </Card>

        {/* Date Selector */}
        <View style={styles.sectionHeader}>
          <CalendarIcon size={14} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Select Date (October 2026)</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {dates.map((d) => {
            const isSelected = selectedDate === d.full;
            return (
              <TouchableOpacity
                key={d.full}
                onPress={() => setSelectedDate(d.full)}
                style={[styles.dateChip, isSelected && styles.dateChipActive]}
              >
                <Text style={[styles.dateLabel, isSelected && styles.dateLabelActive]}>
                  {d.label}
                </Text>
                <Text style={[styles.dateDay, isSelected && styles.dateDayActive]}>
                  {d.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slot Grid */}
        <View style={styles.sectionHeader}>
          <Clock size={14} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
        </View>

        <View style={styles.timeGrid}>
          {timeSlots.map((slot) => {
            const isSelected = selectedTime === slot;
            return (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedTime(slot)}
                style={[styles.timeChip, isSelected && styles.timeChipActive]}
              >
                <Text style={[styles.timeText, isSelected && styles.timeTextActive]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Service Address */}
        <View style={styles.sectionHeader}>
          <MapPin size={14} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Service Location</Text>
        </View>

        <View style={styles.addressBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel}>Home Address</Text>
            <Text style={styles.addressText}>{address}</Text>
          </View>
        </View>

        {/* Problem Description with AI Assist */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Describe Your Issue</Text>
          <TouchableOpacity
            style={styles.aiAssistBtn}
            onPress={handleAiAssist}
            disabled={isAiLoading}
          >
            <Sparkles size={12} color={COLORS.primary} />
            <Text style={styles.aiAssistText}>
              {isAiLoading ? 'Refining...' : 'Refine with AI'}
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.textArea}
          placeholder="Describe what needs repair..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* AI Suggested Problem Summary Card */}
        {aiRefined && (
          <View style={styles.aiSuggestionBox}>
            <View style={styles.aiSuggestHeader}>
              <Sparkles size={13} color={COLORS.primary} />
              <Text style={styles.aiSuggestTitle}>AI Suggested Problem Summary</Text>
            </View>
            <Text style={styles.aiSuggestText}>{aiRefined}</Text>
            <TouchableOpacity
              style={styles.useSummaryBtn}
              onPress={() => {
                setDescription(aiRefined);
                setAiRefined(null);
              }}
            >
              <CheckCircle2 size={12} color="#FFFFFF" />
              <Text style={styles.useSummaryText}>Use this summary</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Method Option */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Preference</Text>
        </View>

        <View style={styles.paymentRow}>
          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'cash' && styles.paymentCardActive]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Banknote size={20} color={paymentMethod === 'cash' ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.paymentTitle, paymentMethod === 'cash' && styles.paymentTitleActive]}>
              Pay after Service (Cash)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'online' && styles.paymentCardActive]}
            onPress={() => setPaymentMethod('online')}
          >
            <CreditCard size={20} color={paymentMethod === 'online' ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.paymentTitle, paymentMethod === 'online' && styles.paymentTitleActive]}>
              Online (Instant)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total Estimate</Text>
          <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
          <Text style={styles.totalSubtitle}>Includes 1 hr base service</Text>
        </View>
        <Button
          title="Confirm & Proceed"
          variant="accent"
          size="lg"
          loading={submitting}
          onPress={handleConfirmBooking}
          style={{ flex: 1, marginLeft: 20 }}
        />
      </View>

      {/* Themed Booking Confirmed Modal */}
      <BookingConfirmedModal
        visible={showConfirmedModal}
        bookingData={confirmedBookingData}
        onViewBooking={() => {
          setShowConfirmedModal(false);
          if (confirmedBookingData?.bookingId) {
            router.replace(`/booking/${confirmedBookingData.bookingId}`);
          }
        }}
        onGoToBookings={() => {
          setShowConfirmedModal(false);
          router.replace('/(customer)/bookings');
        }}
        onClose={() => {
          setShowConfirmedModal(false);
          router.replace('/(customer)/bookings');
        }}
      />

      {/* Small Feedback Pop-up Modal */}
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
  topSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  scroll: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 14,
    paddingBottom: 90,
  },
  providerCard: {
    padding: 14,
    marginBottom: 16,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  providerCat: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateScroll: {
    marginBottom: 16,
  },
  dateChip: {
    width: 54,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dateChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  dateLabelActive: {
    color: '#BFDBFE',
  },
  dateDay: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain,
    marginTop: 2,
  },
  dateDayActive: {
    color: '#FFFFFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  timeTextActive: {
    color: '#FFFFFF',
  },
  addressBox: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
    marginTop: 2,
  },
  aiAssistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginLeft: 'auto',
    gap: 4,
  },
  aiAssistText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 13,
    color: COLORS.textMain,
    height: 70,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  aiSuggestionBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
  },
  aiSuggestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiSuggestTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  aiSuggestText: {
    fontSize: 12,
    color: COLORS.textMain,
    lineHeight: 17,
  },
  useSummaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 8,
  },
  useSummaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paymentRow: {
    gap: 8,
    marginBottom: 20,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
  },
  paymentCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F8FAFF',
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  paymentTitleActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  totalSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
