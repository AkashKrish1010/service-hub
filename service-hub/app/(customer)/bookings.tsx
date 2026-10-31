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
import { Skeleton } from '../../components/ui/Skeleton';
import { bookingService } from '../../services/booking.service';
import { TopNavbar } from '../../components/common/TopNavbar';

export default function CustomerBookings() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchBookings();
  }, [selectedTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings(
        selectedTab === 'all' ? undefined : selectedTab
      );
      setBookings(data || []);
    } catch (e) {
      console.warn('Failed to load my bookings', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNavbar subtitle="My Bookings & Orders" />

      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>Track and manage your service requests</Text>
      </View>

      {/* Tabs Row */}
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
                <Text
                  style={[
                    styles.tabText,
                    isSelected && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Skeleton height={130} borderRadius={16} style={{ marginBottom: 12 }} />
          <Skeleton height={130} borderRadius={16} style={{ marginBottom: 12 }} />
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
              userRole="customer"
              onPress={() => router.push(`/booking/${item._id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Bookings Found</Text>
              <Text style={styles.emptySubtitle}>
                You do not have any {selectedTab !== 'all' ? selectedTab : ''} bookings at this time.
              </Text>
            </View>
          }
        />
      )}
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
    paddingBottom: 8,
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
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
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
    textAlignVertical: 'center',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: SPACING.screenPadding,
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
