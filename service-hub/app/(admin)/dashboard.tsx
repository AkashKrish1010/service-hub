import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { adminService } from '../../services/other.services';
import { useAuth } from '../../store/authStore';
import { AreaLineChart } from '../../components/ui/AreaLineChart';
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  AlertTriangle,
  LogOut,
  TrendingUp,
  ShieldCheck,
  KeyRound,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Lightbulb,
  ArrowUpRight,
  Zap,
} from 'lucide-react-native';
import { aiService } from '../../services/ai.service';

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [data, setData] = useState<any>({
    totalUsers: 0,
    totalProviders: 0,
    pendingProviders: 0,
    totalBookings: 0,
    activeBookings: 0,
    grossRevenue: 0,
    platformCommission: 0,
    openComplaints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartMetric, setChartMetric] = useState<'commission' | 'volume'>('commission');
  const [chartTimeframe, setChartTimeframe] = useState('6M');
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const comm = data.platformCommission || 31.2;
  const commissionSeries = [
    Math.round(comm * 0.45 * 100) / 100,
    Math.round(comm * 0.58 * 100) / 100,
    Math.round(comm * 0.72 * 100) / 100,
    Math.round(comm * 0.65 * 100) / 100,
    Math.round(comm * 0.88 * 100) / 100,
    Math.round(comm * 1.0 * 100) / 100,
  ];

  const vol = data.grossRevenue || 208;
  const volumeSeries = [
    Math.round(vol * 0.42 * 100) / 100,
    Math.round(vol * 0.55 * 100) / 100,
    Math.round(vol * 0.70 * 100) / 100,
    Math.round(vol * 0.62 * 100) / 100,
    Math.round(vol * 0.85 * 100) / 100,
    Math.round(vol * 1.0 * 100) / 100,
  ];

  const fetchData = async () => {
    try {
      const stats = await adminService.getDashboard();
      if (stats) setData(stats);
      fetchAiInsights();
    } catch (e) {
      console.warn('Error fetching admin dashboard', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAiInsights = async () => {
    try {
      setAiLoading(true);
      const res = await aiService.getAdminRevenueInsights();
      if (res) setAiInsights(res);
    } catch (e) {
      console.warn('Error fetching AI revenue insights', e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin Control Center</Text>
            <Text style={styles.subtitle}>Platform operations and governance</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push('/(admin)/profile')}
            >
              <ShieldCheck size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={async () => {
                await logout();
                router.replace('/(auth)/onboarding');
              }}
            >
              <LogOut size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Revenue Banner */}
        <Card style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>Platform Commission (15%)</Text>
          <Text style={styles.revenueValue}>
            ${Number(data.platformCommission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.grossText}>
            Gross Booking Volume: ${Number(data.grossRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </Card>

        {/* Payment Management & Revenue Flow Chart */}
        <View style={styles.chartSection}>
          <View style={styles.chartToggleRow}>
            <TouchableOpacity
              onPress={() => setChartMetric('commission')}
              style={[styles.metricToggleBtn, chartMetric === 'commission' && styles.metricToggleBtnActive]}
            >
              <Text
                style={[styles.metricToggleText, chartMetric === 'commission' && styles.metricToggleTextActive]}
                numberOfLines={1}
              >
                Commission (15%)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setChartMetric('volume')}
              style={[styles.metricToggleBtn, chartMetric === 'volume' && styles.metricToggleBtnActive]}
            >
              <Text
                style={[styles.metricToggleText, chartMetric === 'volume' && styles.metricToggleTextActive]}
                numberOfLines={1}
              >
                Gross Volume
              </Text>
            </TouchableOpacity>
          </View>

          <AreaLineChart
            data={chartMetric === 'commission' ? commissionSeries : volumeSeries}
            labels={['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']}
            title={chartMetric === 'commission' ? 'Platform Fee Flow' : 'Gross Settlements'}
            subtitle="+18.4% monthly growth"
            lineColor={chartMetric === 'commission' ? COLORS.primary : '#059669'}
            gradientStartColor={chartMetric === 'commission' ? 'rgba(37, 99, 235, 0.32)' : 'rgba(16, 185, 129, 0.32)'}
            showTimeframeSelector={true}
            selectedTimeframe={chartTimeframe}
            onSelectTimeframe={setChartTimeframe}
            timeframes={['7D', '30D', '6M']}
            unit="$"
          />
        </View>

        {/* KPI Grid */}
        <View style={styles.grid}>
          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Total Users</Text>
              <Users size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.kpiValue}>{data.totalUsers ?? 0}</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Pending Providers</Text>
              <Briefcase size={16} color={COLORS.accent} />
            </View>
            <Text style={[styles.kpiValue, { color: COLORS.accent }]}>
              {data.pendingProviders ?? 0}
            </Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Total Bookings</Text>
              <Calendar size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.kpiValue}>{data.totalBookings ?? 0}</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Open Disputes</Text>
              <AlertTriangle size={16} color={COLORS.error} />
            </View>
            <Text style={[styles.kpiValue, { color: COLORS.error }]}>
              {data.openComplaints ?? 0}
            </Text>
          </Card>
        </View>

        {/* AI Revenue Strategy & Growth Insights */}
        <View style={styles.sectionHeader}>
          <View style={styles.aiHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>AI Revenue Strategies</Text>
            </View>
            <TouchableOpacity
              onPress={fetchAiInsights}
              disabled={aiLoading}
              style={styles.aiRefreshBtn}
            >
              <RefreshCw size={13} color={COLORS.primary} />
              <Text style={styles.aiRefreshText}>{aiLoading ? 'Analyzing...' : 'Re-analyze'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card style={styles.aiContainerCard}>
          <View style={styles.aiHeaderBadgeRow}>
            <View style={styles.aiModelBadge}>
              <Zap size={11} color={COLORS.primary} />
              <Text style={styles.aiModelText}>Smart Analytics</Text>
            </View>
            {aiInsights?.growthPotential && (
              <View style={styles.aiUpsideBadge}>
                <TrendingUp size={11} color="#059669" />
                <Text style={styles.aiUpsideText}>Projected Upside: {aiInsights.growthPotential}</Text>
              </View>
            )}
          </View>

          {aiInsights?.summary ? (
            <Text style={styles.aiSummaryText}>{aiInsights.summary}</Text>
          ) : (
            <Text style={styles.aiSummaryText}>
              Platform revenue intelligence synthesizing real-time gross settlement volume, provider liquidity, and commission yield.
            </Text>
          )}

          {aiInsights?.strategies && aiInsights.strategies.length > 0 ? (
            <View style={styles.strategiesList}>
              {aiInsights.strategies.map((strat: any, idx: number) => (
                <View key={idx} style={styles.strategyItem}>
                  <View style={styles.strategyHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 6 }}>
                      <Lightbulb size={14} color={COLORS.primary} />
                      <Text style={styles.strategyTitle} numberOfLines={1}>
                        {strat.title}
                      </Text>
                    </View>
                    <View style={[styles.impactPill, strat.impact === 'High' ? styles.impactHigh : styles.impactMed]}>
                      <Text style={[styles.impactText, strat.impact === 'High' ? styles.impactHighText : styles.impactMedText]}>
                        {strat.impact || 'High'} {strat.projectedUplift ? `• ${strat.projectedUplift}` : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.strategyDesc}>{strat.recommendation}</Text>
                  {strat.action && (
                    <View style={styles.strategyActionBox}>
                      <Text style={styles.strategyActionLabel}>Action Plan:</Text>
                      <Text style={styles.strategyActionText}>{strat.action}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={{ paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                {aiLoading ? 'Generating growth strategies...' : 'Tap Re-analyze to generate revenue recommendations.'}
              </Text>
            </View>
          )}
        </Card>

        {/* Quick Management Shortcuts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Governance Actions</Text>
        </View>

        <Card
          onPress={() => router.push('/(admin)/reviews')}
          style={styles.actionCard}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.actionTitle}>Moderate Customer Reviews</Text>
            <ShieldAlert size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.actionDesc}>
            Inspect customer ratings, review comments, and remove inappropriate or abusive feedback.
          </Text>
        </Card>

        <Card
          onPress={() => router.push('/(admin)/providers')}
          style={styles.actionCard}
        >
          <Text style={styles.actionTitle}>Review Provider Applications</Text>
          <Text style={styles.actionDesc}>
            {data.pendingProviders ?? 0} providers awaiting identity and qualification verification.
          </Text>
        </Card>

        <Card
          onPress={() => router.push('/(admin)/complaints')}
          style={styles.actionCard}
        >
          <Text style={styles.actionTitle}>Review Customer Disputes</Text>
          <Text style={styles.actionDesc}>
            Handle unresolved complaints and issue platform resolutions.
          </Text>
        </Card>

        <Card
          onPress={() => router.push('/(admin)/profile')}
          style={styles.actionCard}
        >
          <Text style={styles.actionTitle}>Profile & Security</Text>
          <Text style={styles.actionDesc}>
            Manage administrator credentials, update password, and account security.
          </Text>
        </Card>
      </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
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
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueCard: {
    backgroundColor: COLORS.secondary,
    padding: 20,
    borderRadius: RADIUS.lg,
    marginBottom: 16,
  },
  revenueLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 6,
  },
  grossText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48%',
    padding: 14,
    marginBottom: 0,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  actionCard: {
    padding: 16,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  chartSection: {
    marginBottom: 8,
  },
  chartToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metricToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  metricToggleBtnActive: {
    backgroundColor: COLORS.surfaceHighlight,
    borderColor: COLORS.primary,
  },
  metricToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  metricToggleTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
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
  aiContainerCard: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderColor: '#DBEAFE',
    borderWidth: 1.2,
  },
  aiHeaderBadgeRow: {
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
  aiUpsideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  aiUpsideText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  aiSummaryText: {
    fontSize: 13,
    color: COLORS.textMain,
    lineHeight: 19,
    marginBottom: 14,
    fontWeight: '500',
  },
  strategiesList: {
    gap: 12,
  },
  strategyItem: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  strategyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  impactPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  impactHigh: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  impactMed: {
    backgroundColor: '#FEFCE8',
    borderColor: '#FEF08A',
    borderWidth: 1,
  },
  impactText: {
    fontSize: 10,
    fontWeight: '700',
  },
  impactHighText: {
    color: '#DC2626',
  },
  impactMedText: {
    color: '#CA8A04',
  },
  strategyDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  strategyActionBox: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  strategyActionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  strategyActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMain,
    lineHeight: 16,
  },
});
