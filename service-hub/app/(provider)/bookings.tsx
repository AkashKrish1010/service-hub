import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { BookingCard } from '../../components/booking/BookingCard';
import { bookingService } from '../../services/booking.service';
import { Skeleton } from '../../components/ui/Skeleton';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';
import { TopNavbar } from '../../components/common/TopNavbar';
import { CompleteJobModal } from '../../components/booking/CompleteJobModal';

export default function ProviderBookings() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [completeModalConfig, setCompleteModalConfig] = useState<{
    visible: boolean;
    bookingId: string;
    bookingTitle: string;
  }>({
    visible: false,
    bookingId: '',
    bookingTitle: '',
  });

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

  const tabs = [
    { key: 'all', label: 'All Jobs' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'completed', label: 'Completed' },
  ];

  useEffect(() => {
    fetchBookings();
  }, [selectedTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getProviderBookings(
        selectedTab === 'all' ? undefined : selectedTab
      );
      setBookings(data || []);
    } catch (e) {
      console.warn('Error loading provider bookings', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    if (action === 'complete') {
      const targetBooking = bookings.find((b) => b._id === id);
      setCompleteModalConfig({
        visible: true,
        bookingId: id,
        bookingTitle: targetBooking?.description || 'Complete Job',
      });
      return;
    }

    const statusMap: Record<string, string> = {
      accept: 'accepted',
      reject: 'cancelled',
    };
    const targetStatus = statusMap[action];
    if (!targetStatus) return;

    try {
      await bookingService.updateStatus(id, targetStatus);
      setAlertConfig({
        visible: true,
        title: 'Status Updated',
        message: `Booking has been successfully updated to ${targetStatus.toUpperCase()}.`,
        type: 'success',
      });
      fetchBookings();
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Update Failed',
        message: 'Failed to update booking status. Please try again.',
        type: 'error',
      });
    }
  };

  const handleConfirmComplete = async (proof: {
    completionPhoto?: string;
    completionReason?: string;
  }) => {
    try {
      await bookingService.updateStatus(
        completeModalConfig.bookingId,
        'completed',
        proof
      );
      setAlertConfig({
        visible: true,
        title: 'Job Completed',
        message: 'The booking has been marked completed and verification recorded.',
        type: 'success',
      });
      fetchBookings();
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Update Failed',
        message: 'Could not mark job as completed. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar for Provider */}
      <TopNavbar subtitle="Provider Console" showSearch={false} />

      <View style={styles.header}>
        <Text style={styles.title}>Manage Bookings</Text>
        <Text style={styles.subtitle}>Accept new jobs and update ongoing status</Text>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => {
            const isSelected = selectedTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setSelectedTab(tab.key)}
                activeOpacity={0.8}
                style={[
                  styles.tabPill,
                  isSelected ? styles.tabPillActive : styles.tabPillInactive,
                ]}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ padding: 16 }}>
          <Skeleton height={140} borderRadius={16} style={{ marginBottom: 12 }} />
          <Skeleton height={140} borderRadius={16} style={{ marginBottom: 12 }} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings();
              }}
            />
          }
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              userRole="provider"
              onPress={() => router.push(`/booking/${item._id}`)}
              onAction={(action) => handleAction(item._id, action)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Jobs Found</Text>
              <Text style={styles.emptySubtitle}>
                No bookings match your current filter.
              </Text>
            </View>
          }
        />
      )}

      {/* Complete Job Verification Modal */}
      <CompleteJobModal
        visible={completeModalConfig.visible}
        bookingId={completeModalConfig.bookingId}
        bookingTitle={completeModalConfig.bookingTitle}
        onClose={() =>
          setCompleteModalConfig({ visible: false, bookingId: '', bookingTitle: '' })
        }
        onConfirm={handleConfirmComplete}
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
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 12,
    paddingBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabsWrapper: {
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 6,
  },
  tabsContainer: {
    paddingHorizontal: SPACING.screenPadding,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tabPill: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabPillInactive: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    textAlign: 'center',
    includeFontPadding: false,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: SPACING.screenPadding,
    paddingBottom: 40,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
});
