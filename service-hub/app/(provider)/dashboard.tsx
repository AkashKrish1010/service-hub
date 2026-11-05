import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { providerService } from '../../services/provider.service';
import { bookingService } from '../../services/booking.service';
import { useAuth } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  MapPin,
  Bell,
  LogOut,
  Calendar,
  Sparkles,
  RefreshCw,
  Lightbulb,
  ThumbsUp,
  AlertCircle,
  Award,
  Zap,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react-native';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';
import { TopNavbar } from '../../components/common/TopNavbar';
import { CompleteJobModal } from '../../components/booking/CompleteJobModal';
import { aiService } from '../../services/ai.service';

export default function ProviderDashboard() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const socket = useSocket();
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [ongoingBookings, setOngoingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiCoach, setAiCoach] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(true);

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

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUserUpdated = () => {
      refreshUser();
      fetchDashboard();
    };
    socket.on('user_updated', handleUserUpdated);
    return () => {
      socket.off('user_updated', handleUserUpdated);
    };
  }, [socket]);

  const fetchDashboard = async () => {
    try {
      await refreshUser().catch(() => null);
      const [statsData, bookingsData] = await Promise.all([
        providerService.getDashboardStats().catch(() => null),
        bookingService.getProviderBookings().catch(() => []),
      ]);

      setStats(statsData || {
        totalEarnings: 0,
        activeBookings: 0,
        completedBookings: 0,
        averageRating: 0.0,
        totalReviews: 0,
      });

      const pending = (bookingsData || []).filter((b: any) => b.status === 'pending');
      const ongoing = (bookingsData || []).filter((b: any) => b.status === 'ongoing' || b.status === 'accepted');

      setPendingBookings(pending);
      setOngoingBookings(ongoing);
      fetchAiCoach();
    } catch (e) {
      console.warn('Error loading provider dashboard', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAiCoach = async () => {
    try {
      setAiLoading(true);
      const res = await aiService.getProviderInsights();
      if (res) setAiCoach(res);
    } catch (e) {
      console.warn('Error fetching provider AI insights', e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await bookingService.updateStatus(id, newStatus);
      setAlertConfig({
        visible: true,
        title: 'Status Updated',
        message: `Booking has been marked as ${newStatus.toUpperCase()}.`,
        type: 'success',
      });
      fetchDashboard();
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Update Error',
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
        message: 'The booking has been marked completed and verification proof recorded.',
        type: 'success',
      });
      fetchDashboard();
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Update Error',
        message: 'Failed to complete job. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Provider Top Navbar */}
      <TopNavbar subtitle="Provider Console" showSearch={false} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDashboard();
            }}
          />
        }
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.push('/(provider)/profile-setup')}
              activeOpacity={0.8}
              accessibilityLabel="Edit provider profile"
            >
              <Avatar
                uri={user?.profileImage || ''}
                name={user?.name || 'Provider'}
                size={48}
                isOnline={isOnline && user?.isApproved !== false}
              />
            </TouchableOpacity>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.providerName}>{user?.name || 'Provider'}</Text>
            </View>
          </View>
        </View>

        {/* Pending Admin Approval Banner */}
        {user?.isApproved === false && (
          <View style={styles.pendingBanner}>
            <View style={styles.pendingHeaderRow}>
              <ShieldAlert size={20} color="#D97706" />
              <Text style={styles.pendingTitle}>Account Verification Pending</Text>
            </View>
            <Text style={styles.pendingText}>
              Waiting for admin to verify and approve. You cannot receive bookings or toggle online status until your profile credentials and category have been reviewed by our administrative team.
            </Text>
            <View style={styles.pendingBadge}>
              <Clock size={12} color="#92400E" />
              <Text style={styles.pendingBadgeText}>Status: Pending Review</Text>
            </View>
          </View>
        )}

        {/* Online / Offline Toggle Banner */}
        <View style={[styles.toggleCard, user?.isApproved === false && styles.toggleCardDisabled]}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.toggleTitle}>
              {user?.isApproved === false
                ? 'Approval Required to Go Online'
                : isOnline
                ? 'You are Online & Accepting Jobs'
                : 'You are Currently Offline'}
            </Text>
            <Text style={styles.toggleSubtitle}>
              {user?.isApproved === false
                ? 'Waiting for admin to verify and approve your account.'
                : isOnline
                ? 'Nearby customers can discover and book you'
                : 'Switch online to receive new requests'}
            </Text>
          </View>
          <Switch
            value={user?.isApproved === false ? false : isOnline}
            onValueChange={(val) => {
              if (user?.isApproved === false) {
                setAlertConfig({
                  visible: true,
                  title: 'Verification Pending',
                  message: 'Waiting for admin to verify and approve before going online.',
                  type: 'warning',
                });
                return;
              }
              setIsOnline(val);
            }}
            disabled={user?.isApproved === false}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={isOnline && user?.isApproved !== false ? COLORS.primary : '#F3F4F6'}
          />
        </View>

        {/* Quick Stats 2x2 Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Total Earnings</Text>
              <TrendingUp size={16} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>
              ${stats ? Number(stats.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
            </Text>
            <Text style={styles.statGrowth}>Gross revenue</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Active Bookings</Text>
              <Clock size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>
              {stats ? stats.activeBookings : 0}
            </Text>
            <Text style={styles.statGrowth}>In Progress</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Completed Jobs</Text>
              <CheckCircle2 size={16} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>
              {stats ? stats.completedBookings : 0}
            </Text>
            <Text style={styles.statGrowth}>Lifetime total</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Customer Rating</Text>
              <Star
                size={16}
                color="#FBBF24"
                fill={Number(stats?.averageRating || 0) === 0 ? 'none' : '#FBBF24'}
              />
            </View>
            <Text style={styles.statValue}>
              {stats ? Number(stats.averageRating || 0).toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.statGrowth}>
              {stats?.totalReviews && Number(stats.totalReviews) > 0
                ? `from ${stats.totalReviews} reviews`
                : 'New Provider (0 reviews)'}
            </Text>
          </Card>
        </View>

        {/* AI Performance Coach & Review Insights */}
        <View style={styles.sectionHeader}>
          <View style={styles.aiHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>AI Performance & Review Coach</Text>
            </View>
            <TouchableOpacity
              onPress={fetchAiCoach}
              disabled={aiLoading}
              style={styles.aiRefreshBtn}
            >
              <RefreshCw size={13} color={COLORS.primary} />
              <Text style={styles.aiRefreshText}>{aiLoading ? 'Analyzing...' : 'Re-analyze'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card style={styles.aiCoachCard}>
          {/* Header metadata row */}
          <View style={styles.aiBadgeRow}>
            <View style={styles.aiModelBadge}>
              <Zap size={11} color={COLORS.primary} />
              <Text style={styles.aiModelText}>Pro Insights</Text>
            </View>
            {(aiCoach?.sentiment || aiCoach?.sentimentPercentage != null) && (
              <View
                style={[
                  styles.sentimentBadge,
                  (aiCoach.sentimentPercentage != null ? aiCoach.sentimentPercentage >= 75 : aiCoach.sentiment === 'Positive')
                    ? styles.sentimentPositive
                    : styles.sentimentNeutral,
                ]}
              >
                <Award
                  size={11}
                  color={
                    (aiCoach.sentimentPercentage != null ? aiCoach.sentimentPercentage >= 75 : aiCoach.sentiment === 'Positive')
                      ? '#059669'
                      : '#D97706'
                  }
                />
                <Text
                  style={[
                    styles.sentimentText,
                    (aiCoach.sentimentPercentage != null ? aiCoach.sentimentPercentage >= 75 : aiCoach.sentiment === 'Positive')
                      ? styles.sentimentPositiveText
                      : styles.sentimentNeutralText,
                  ]}
                >
                  {aiCoach.sentimentPercentage != null ? `${aiCoach.sentimentPercentage}% ` : ''}
                  {aiCoach.sentiment || 'Positive'} Reputation
                </Text>
              </View>
            )}
          </View>

          {/* Visual Sentiment Meter */}
          {aiCoach?.sentimentPercentage != null && (
            <View style={styles.aiSentimentMeterContainer}>
              <View style={styles.aiSentimentMeterHeader}>
                <Text style={styles.aiSentimentMeterLabel}>Customer Sentiment Index</Text>
                <Text style={styles.aiSentimentMeterValue}>{aiCoach.sentimentPercentage}% Positive</Text>
              </View>
              <View style={styles.aiMeterTrack}>
                <View
                  style={[
                    styles.aiMeterFill,
                    {
                      width: `${Math.min(100, Math.max(5, aiCoach.sentimentPercentage))}%`,
                      backgroundColor:
                        aiCoach.sentimentPercentage >= 75
                          ? '#10B981'
                          : aiCoach.sentimentPercentage >= 50
                          ? '#F59E0B'
                          : '#EF4444',
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* AI Synthesis Summary */}
          {aiCoach?.summary ? (
            <Text style={styles.aiCoachSummary}>{aiCoach.summary}</Text>
          ) : (
            <Text style={styles.aiCoachSummary}>
              Evaluating real-time customer reviews, verified ratings, and job settlement history to generate tailored growth recommendations.
            </Text>
          )}

          {aiCoach && (
            <View style={{ marginTop: 10 }}>
              {/* Strengths identified */}
              {aiCoach.strengths && aiCoach.strengths.length > 0 && (
                <View style={styles.insightBlock}>
                  <View style={styles.blockTitleRow}>
                    <ThumbsUp size={13} color="#059669" />
                    <Text style={[styles.blockTitle, { color: '#059669' }]}>Customer-Praised Strengths</Text>
                  </View>
                  {aiCoach.strengths.map((str: string, sIdx: number) => (
                    <View key={sIdx} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: '#059669' }]} />
                      <Text style={styles.bulletText}>{str}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Areas for Improvement */}
              {aiCoach.areasForImprovement && aiCoach.areasForImprovement.length > 0 && (
                <View style={styles.insightBlock}>
                  <View style={styles.blockTitleRow}>
                    <AlertCircle size={13} color="#D97706" />
                    <Text style={[styles.blockTitle, { color: '#D97706' }]}>Areas for Improvement</Text>
                  </View>
                  {aiCoach.areasForImprovement.map((area: string, aIdx: number) => (
                    <View key={aIdx} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: '#D97706' }]} />
                      <Text style={styles.bulletText}>{area}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Actionable Tips to Improve More */}
              {aiCoach.actionableTips && aiCoach.actionableTips.length > 0 && (
                <View style={[styles.insightBlock, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <View style={styles.blockTitleRow}>
                    <Lightbulb size={13} color={COLORS.primary} />
                    <Text style={[styles.blockTitle, { color: COLORS.primary }]}>Growth Playbook (How to Improve More)</Text>
                  </View>
                  {aiCoach.actionableTips.map((tip: any, tIdx: number) => (
                    <View key={tIdx} style={styles.tipBox}>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <Text style={styles.tipAction}>{tip.action || tip.tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {!aiCoach && (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                {aiLoading ? 'Analyzing customer reviews and ratings...' : 'Tap Re-analyze to generate performance tips.'}
              </Text>
            </View>
          )}
        </Card>

        {/* Urgent Booking Requests (Accept / Reject) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            New Booking Requests ({pendingBookings.length})
          </Text>
        </View>

        {pendingBookings.length === 0 ? (
          <View style={styles.noRequestsCard}>
            <Text style={styles.noRequestsText}>No pending requests right now.</Text>
          </View>
        ) : (
          pendingBookings.map((b) => (
            <Card key={b._id} style={styles.requestCard}>
              <View style={styles.requestTop}>
                <View style={styles.requestLeft}>
                  <Text style={styles.customerName}>
                    {b.customerId?.name || 'Customer'}
                  </Text>
                  <Text style={styles.serviceName}>{b.description}</Text>
                  <View style={styles.locationRow}>
                    <MapPin size={12} color={COLORS.textMuted} />
                    <Text style={styles.locationText}>{b.serviceAddress}</Text>
                  </View>
                </View>
                <Text style={styles.payout}>${b.totalAmount}</Text>
              </View>

              <View style={styles.requestActions}>
                <Button
                  title="Reject"
                  variant="outline"
                  size="sm"
                  onPress={() => handleStatusUpdate(b._id, 'cancelled')}
                  style={{ flex: 1, marginRight: 8, borderColor: COLORS.error }}
                  textStyle={{ color: COLORS.error }}
                />
                <Button
                  title="Accept Booking"
                  variant="primary"
                  size="sm"
                  onPress={() => handleStatusUpdate(b._id, 'accepted')}
                  style={{ flex: 1.5 }}
                />
              </View>
            </Card>
          ))
        )}

        {/* Ongoing Schedule */}
        <View style={[styles.sectionHeader, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Active Schedule</Text>
        </View>

        {ongoingBookings.length === 0 ? (
          <View style={styles.noRequestsCard}>
            <Text style={styles.noRequestsText}>No active ongoing jobs right now.</Text>
          </View>
        ) : (
          ongoingBookings.map((b) => (
            <Card key={b._id} style={styles.ongoingCard}>
              <View style={styles.ongoingTop}>
                <View style={styles.ongoingLeft}>
                  <Text style={styles.ongoingTime}>
                    {b.scheduledDate} • {b.scheduledTime}
                  </Text>
                  <Text style={styles.ongoingTitle}>{b.description}</Text>
                  <Text style={styles.ongoingCustomer}>
                    Customer: {b.customerId?.name || 'Customer'}
                  </Text>
                </View>
                <View style={styles.ongoingStatusBadge}>
                  <Text style={styles.ongoingStatusText}>{b.status.toUpperCase()}</Text>
                </View>
              </View>

              <Button
                title="Mark as Completed"
                variant="accent"
                size="sm"
                onPress={() =>
                  setCompleteModalConfig({
                    visible: true,
                    bookingId: b._id,
                    bookingTitle: b.description || 'Job Completion',
                  })
                }
                style={{ marginTop: 12 }}
              />
            </Card>
          ))
        )}
      </ScrollView>

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
  scroll: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pendingBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
  },
  pendingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  pendingText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 10,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  toggleCardDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.8,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  toggleSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 14,
    marginBottom: 0,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  statGrowth: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  noRequestsCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  noRequestsText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  requestCard: {
    padding: 16,
    marginBottom: 12,
  },
  requestTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  requestLeft: {
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  serviceName: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  payout: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    flexShrink: 0,
  },
  requestActions: {
    flexDirection: 'row',
  },
  ongoingCard: {
    padding: 16,
    marginBottom: 12,
  },
  ongoingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ongoingLeft: {
    flex: 1,
    marginRight: 12,
  },
  ongoingTime: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  ongoingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 2,
  },
  ongoingCustomer: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  ongoingStatusBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  ongoingStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  aiRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  aiRefreshText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  aiCoachCard: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderColor: '#DBEAFE',
    borderWidth: 1.2,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  aiModelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  aiModelText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  sentimentPositive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  sentimentNeutral: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  sentimentText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sentimentPositiveText: {
    color: '#059669',
  },
  sentimentNeutralText: {
    color: '#D97706',
  },
  aiSentimentMeterContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiSentimentMeterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiSentimentMeterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  aiSentimentMeterValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  aiMeterTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  aiMeterFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  aiCoachSummary: {
    fontSize: 13,
    color: COLORS.textMain,
    lineHeight: 19,
    marginBottom: 12,
    fontWeight: '500',
  },
  insightBlock: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  blockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  blockTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
  },
  bulletText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    flex: 1,
  },
  tipBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  tipAction: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
});
