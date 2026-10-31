import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Rating } from '../../components/ui/Rating';
import { Button } from '../../components/ui/Button';
import { reviewService } from '../../services/other.services';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';
import {
  ArrowLeft,
  Trash2,
  Search,
  Star,
  ShieldAlert,
  Calendar,
  Briefcase,
  AlertTriangle,
} from 'lucide-react-native';

export default function AdminReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info' | 'destructive' | 'confirm';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getAll();
      setReviews(data || []);
    } catch (e) {
      console.warn('Error fetching all reviews', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleConfirmDelete = (review: any) => {
    setAlertConfig({
      visible: true,
      title: 'Remove Inappropriate Review',
      message: `Are you sure you want to permanently delete this review from ${review.customerId?.name || 'Customer'}? The provider's rating will be automatically recalculated.`,
      type: 'destructive',
      confirmText: 'Delete Review',
      cancelText: 'Keep Review',
      onConfirm: async () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        try {
          await reviewService.delete(review._id);
          setAlertConfig({
            visible: true,
            title: 'Review Removed',
            message: 'The inappropriate review was deleted and the provider rating score updated.',
            type: 'success',
            confirmText: 'Done',
            onConfirm: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              fetchReviews();
            },
          });
        } catch (err: any) {
          setAlertConfig({
            visible: true,
            title: 'Action Failed',
            message: err.response?.data?.message || 'Failed to remove review.',
            type: 'error',
            confirmText: 'Dismiss',
            onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          });
        }
      },
      onCancel: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesRating = selectedRating === 'all' || r.rating === selectedRating;
    const q = searchQuery.toLowerCase();
    const custName = r.customerId?.name?.toLowerCase() || '';
    const provName = r.providerId?.name?.toLowerCase() || '';
    const comment = r.reviewText?.toLowerCase() || '';
    const matchesSearch = !q || custName.includes(q) || provName.includes(q) || comment.includes(q);
    return matchesRating && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color={COLORS.textMain} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.topTitle}>Review Moderation</Text>
          <Text style={styles.topSubtitle}>Audit & remove inappropriate reviews</Text>
        </View>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>{reviews.length}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={16} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by customer, technician, or text..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Rating Filters */}
      <View style={styles.filterRow}>
        {(['all', 1, 2, 3, 4, 5] as const).map((star) => (
          <TouchableOpacity
            key={String(star)}
            onPress={() => setSelectedRating(star)}
            style={[styles.filterChip, selectedRating === star && styles.filterChipActive]}
          >
            {star === 'all' ? (
              <Text
                style={[
                  styles.filterChipText,
                  selectedRating === star && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text
                  style={[
                    styles.filterChipText,
                    selectedRating === star && styles.filterChipTextActive,
                  ]}
                >
                  {star}
                </Text>
                <Star
                  size={11}
                  color={selectedRating === star ? '#FFFFFF' : '#F59E0B'}
                  fill={selectedRating === star ? '#FFFFFF' : '#F59E0B'}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Reviews List */}
      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReviews();
            }}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.reviewCard}>
            {/* Header: Customer Info + Rating */}
            <View style={styles.cardHeader}>
              <Avatar
                uri={item.customerId?.profileImage}
                name={item.customerId?.name || 'Customer'}
                size={38}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.customerName}>{item.customerId?.name || 'Verified Customer'}</Text>
                <Text style={styles.customerEmail}>{item.customerId?.email || 'customer@servicehub.com'}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Star size={12} color="#D97706" fill="#D97706" />
                <Text style={styles.ratingValue}>{item.rating}.0</Text>
              </View>
            </View>

            {/* Provider Target Banner */}
            <View style={styles.providerBanner}>
              <Briefcase size={13} color={COLORS.primary} />
              <Text style={styles.providerBannerText}>
                Reviewed Provider: <Text style={{ fontWeight: '700' }}>{item.providerId?.name || 'Technician'}</Text>
              </Text>
            </View>

            {/* Review Comment Body */}
            <View style={styles.commentBox}>
              <Text style={styles.commentText}>"{item.reviewText}"</Text>
            </View>

            {/* Sub-ratings Breakdown */}
            {(item.serviceQuality || item.providerBehavior) && (
              <View style={styles.subRatingsRow}>
                {item.serviceQuality ? (
                  <View style={styles.subChip}>
                    <Text style={styles.subChipLabel}>Quality: </Text>
                    <Text style={styles.subChipVal}>{item.serviceQuality}/5</Text>
                  </View>
                ) : null}
                {item.providerBehavior ? (
                  <View style={styles.subChip}>
                    <Text style={styles.subChipLabel}>Behavior: </Text>
                    <Text style={styles.subChipVal}>{item.providerBehavior}/5</Text>
                  </View>
                ) : null}
                <View style={{ flex: 1 }} />
                <View style={styles.dateRow}>
                  <Calendar size={11} color={COLORS.textMuted} />
                  <Text style={styles.dateText}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Bar: Delete Inappropriate */}
            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleConfirmDelete(item)}
                activeOpacity={0.8}
              >
                <Trash2 size={14} color={COLORS.error} />
                <Text style={styles.deleteBtnText}>Remove Inappropriate Review</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ShieldAlert size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Reviews Found</Text>
            <Text style={styles.emptySubtitle}>
              {reviews.length === 0
                ? 'No customer reviews submitted yet.'
                : 'No reviews matched your search or rating filter.'}
            </Text>
          </View>
        }
      />

      {/* Themed Confirmation Modal */}
      <ThemedAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
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
  backBtn: {
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
  badgeCount: {
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.screenPadding,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.textMain,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.screenPadding,
    marginTop: 10,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 12,
    paddingBottom: 40,
  },
  reviewCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: RADIUS.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  customerEmail: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  providerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    marginTop: 10,
  },
  providerBannerText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  commentBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.textMain,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  subRatingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  subChip: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  subChipLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  subChipVal: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
