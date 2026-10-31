import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Avatar } from '../../components/ui/Avatar';
import { ProviderCard } from '../../components/provider/ProviderCard';
import { AIRecommendationBanner } from '../../components/ai/AIRecommendationBanner';
import { Skeleton } from '../../components/ui/Skeleton';
import { providerService } from '../../services/provider.service';
import { categoryService } from '../../services/other.services';
import { useAuth } from '../../store/authStore';
import { TopNavbar } from '../../components/common/TopNavbar';
import {
  MapPin,
  ChevronDown,
  Bell,
  Search,
  SlidersHorizontal,
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Cpu,
  Paintbrush,
  Scissors,
  Grid,
  Bot,
} from 'lucide-react-native';

export default function CustomerHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [nearbyData, catData] = await Promise.all([
        providerService.getNearby({ lat: 13.0418, lng: 80.2337, radius: 40 }),
        categoryService.getAll().catch(() => []),
      ]);
      setProviders(nearbyData || []);
      setCategories(catData || []);
    } catch (e) {
      console.warn('Error fetching home data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('plumb')) return <Wrench size={22} color={COLORS.primary} />;
    if (n.includes('elect')) return <Zap size={22} color={COLORS.primary} />;
    if (n.includes('clean')) return <Sparkles size={22} color={COLORS.primary} />;
    if (n.includes('carpent')) return <Hammer size={22} color={COLORS.primary} />;
    if (n.includes('applian')) return <Cpu size={22} color={COLORS.primary} />;
    if (n.includes('paint')) return <Paintbrush size={22} color={COLORS.primary} />;
    if (n.includes('garden')) return <Scissors size={22} color={COLORS.primary} />;
    return <Grid size={22} color={COLORS.primary} />;
  };

  const defaultCategories = [
    { name: 'Plumbing', iconName: 'wrench' },
    { name: 'Electrical', iconName: 'zap' },
    { name: 'Cleaning', iconName: 'sparkles' },
    { name: 'Carpentry', iconName: 'hammer' },
    { name: 'Appliances', iconName: 'cpu' },
    { name: 'Painting', iconName: 'paintbrush' },
    { name: 'Gardening', iconName: 'scissors' },
    { name: 'More', iconName: 'grid' },
  ];

  const displayedCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNavbar />
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
        {/* Service Address Location Sub-Header */}
        <TouchableOpacity
          style={styles.locationSelector}
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/search')}
        >
          <View style={styles.locationPinBadge}>
            <MapPin size={16} color={COLORS.primary} />
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.locationCaption}>Service Address</Text>
            <View style={styles.locationTitleRow}>
              <Text style={styles.locationTitle} numberOfLines={1}>
                {user?.address || 'T. Nagar, Chennai'}
              </Text>
              <ChevronDown size={14} color={COLORS.textMain} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.searchBar}
          onPress={() => router.push('/(customer)/search')}
        >
          <Search size={18} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>
            Search plumbers, electricians, cleaning...
          </Text>
          <View style={styles.filterBtn}>
            <SlidersHorizontal size={15} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {/* AI Recommendation Banner */}
        <AIRecommendationBanner
          title={providers.length > 0 ? `Need quick ${providers[0].category.toLowerCase()} service?` : 'Need quick home repairs?'}
          reason={
            providers.length > 0
              ? `${providers[0].userId?.name || 'Verified Pro'} is nearby with ${providers[0].averageRating} stars. Ready for dispatch.`
              : 'Find certified local technicians ready for immediate dispatch in your area.'
          }
          onQuickBook={() => {
            if (providers.length > 0) {
              const p = providers[0];
              router.push({
                pathname: '/booking/new',
                params: {
                  providerId: p.userId?._id || p._id,
                  providerName: p.userId?.name || 'Verified Pro',
                  category: p.category || 'Service',
                  rate: p.hourlyRate || 40,
                },
              });
            } else {
              router.push('/(customer)/search');
            }
          }}
        />

        {/* Categories Grid (4 columns) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
        </View>

        <View style={styles.categoryGrid}>
          {displayedCategories.slice(0, 8).map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              style={styles.categoryItem}
              onPress={() =>
                router.push({
                  pathname: '/(customer)/search',
                  params: { category: cat.name },
                })
              }
            >
              <View style={styles.categoryIconCircle}>
                {getCategoryIcon(cat.name)}
              </View>
              <Text style={styles.categoryLabel} numberOfLines={1}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nearby Top Providers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Providers Near You</Text>
          <TouchableOpacity onPress={() => router.push('/(customer)/search')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ gap: 12 }}>
            <Skeleton height={140} borderRadius={16} />
            <Skeleton height={140} borderRadius={16} />
          </View>
        ) : providers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Providers Found in Range</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search filters or explore all categories.
            </Text>
          </View>
        ) : (
          providers.map((p) => (
            <ProviderCard
              key={p._id}
              provider={{
                ...p,
                distance: p.distance || '0.8 km away',
              }}
              onPress={() => router.push(`/provider/${p._id}`)}
              onBookNow={() =>
                router.push({
                  pathname: '/booking/new',
                  params: {
                    providerId: p.userId?._id || p._id,
                    providerName: p.userId?.name || 'Verified Pro',
                    category: p.category,
                    rate: p.hourlyRate,
                  },
                })
              }
            />
          ))
        )}
      </ScrollView>

      {/* Floating AI Chat Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.floatingAIBtn}
        onPress={() => router.push('/ai-chat')}
      >
        <Bot size={22} color="#FFFFFF" />
        <Text style={styles.floatingAIText}>AI Assistant</Text>
      </TouchableOpacity>
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
    paddingTop: 8,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  locationPinBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCaption: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unreadDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 10,
  },
  filterBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: '#EFF6FF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMain,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  floatingAIBtn: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingAIText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
