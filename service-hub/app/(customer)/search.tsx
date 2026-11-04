import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { ProviderMap, MapProvider } from '../../components/maps/ProviderMap';
import { ProviderCard } from '../../components/provider/ProviderCard';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Rating } from '../../components/ui/Rating';
import { Badge } from '../../components/ui/Badge';
import { providerService } from '../../services/provider.service';
import { categoryService } from '../../services/other.services';
import { TopNavbar } from '../../components/common/TopNavbar';
import * as Location from 'expo-location';
import {
  Search as SearchIcon,
  SlidersHorizontal,
  MapPin,
  List,
  Map,
  ShieldCheck,
  Zap,
  AlertCircle,
} from 'lucide-react-native';

// --- Distance helpers ---
const NEARBY_RADIUS_KM = 15; // providers within 15km are "nearby"

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistanceLabel(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

export default function SearchScreen() {
  const router = useRouter();
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 13.0418, lng: 80.2337 });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [categories, setCategories] = useState<string[]>([
    'All',
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Carpentry',
    'Appliances',
  ]);

  // Debounce search input
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(text);
    }, 400);
  };

  useEffect(() => {
    categoryService.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const catNames = data.map((c: any) => c.name).filter(Boolean);
        setCategories(['All', ...new Set(catNames)]);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then((pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [selectedCategory, debouncedQuery, userCoords]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const trimmedQuery = debouncedQuery.trim();

      // When user is searching by location/text: bypass geo radius so ALL matching
      // providers show (even ones >15km away). Distance badge will indicate travel.
      // When no search query: use geo radius to find nearby providers.
      const params: any = {
        category: selectedCategory === 'All' ? undefined : selectedCategory,
      };

      if (trimmedQuery) {
        // Location/text search — no geo filter, search all approved providers
        params.search = trimmedQuery;
      } else {
        // Nearby-only mode: 15km radius from user
        params.lat = userCoords.lat;
        params.lng = userCoords.lng;
        params.radius = NEARBY_RADIUS_KM;
      }

      const data = await providerService.getNearby(params);
      setProviders(data || []);
      if (data && data.length > 0) {
        setSelectedProvider(data[0]);
      } else {
        setSelectedProvider(null);
      }
    } catch (e) {
      console.warn('Failed to load search providers', e);
    } finally {
      setLoading(false);
    }
  };

  // Attach computed distance to each provider based on user coords
  const providersWithDistance = providers.map((p) => {
    const pLat = p.location?.coordinates ? p.location.coordinates[1] : null;
    const pLng = p.location?.coordinates ? p.location.coordinates[0] : null;
    const distanceKm = pLat !== null && pLng !== null
      ? haversineKm(userCoords.lat, userCoords.lng, pLat, pLng)
      : null;
    return { ...p, _distanceKm: distanceKm };
  });

  // Sort: nearby first, then far providers
  const sortedProviders = [...providersWithDistance].sort((a, b) => {
    const dA = a._distanceKm ?? 9999;
    const dB = b._distanceKm ?? 9999;
    return dA - dB;
  });

  const mapProviders: MapProvider[] = sortedProviders.map((p) => ({
    id: p._id,
    name: p.userId?.name || 'Verified Pro',
    category: p.category,
    hourlyRate: p.hourlyRate,
    rating: p.averageRating ?? 0,
    lat: p.location?.coordinates ? p.location.coordinates[1] : userCoords.lat,
    lng: p.location?.coordinates ? p.location.coordinates[0] : userCoords.lng,
  }));

  // Client-side filter: when user types, filter results on the client too (belt + suspenders)
  const filteredProviders = sortedProviders.filter((p) => {
    if (!debouncedQuery.trim()) return true;
    const q = debouncedQuery.toLowerCase();
    const nameMatch = (p.userId?.name || '').toLowerCase().includes(q);
    const catMatch = (p.category || '').toLowerCase().includes(q);
    const addressMatch = (p.location?.address || '').toLowerCase().includes(q);
    const bioMatch = (p.bio || '').toLowerCase().includes(q);
    return nameMatch || catMatch || addressMatch || bioMatch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNavbar subtitle="Provider Map & Search" showSearch={false} />
      {/* Top Search Overlay */}
      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputBox}>
            <SearchIcon size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Search by name, location, or service..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
          </View>
          <TouchableOpacity
            style={styles.toggleViewBtn}
            onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          >
            {viewMode === 'map' ? (
              <List size={20} color={COLORS.primary} />
            ) : (
              <Map size={20} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Category Pills Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryPill,
                  isSelected ? styles.categoryPillActive : styles.categoryPillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main View: Map or List */}
      {viewMode === 'map' ? (
        <View style={styles.mapWrapper}>
          <ProviderMap
            providers={mapProviders}
            userLocation={userCoords}
            selectedProviderId={selectedProvider?._id}
            onSelectProvider={(mp) => {
              const matched = providers.find((p) => p._id === mp.id);
              if (matched) setSelectedProvider(matched);
            }}
          />

          {/* Bottom Selected Provider Sheet */}
          {selectedProvider && (() => {
            const selDistKm = (() => {
              const pLat = selectedProvider.location?.coordinates?.[1];
              const pLng = selectedProvider.location?.coordinates?.[0];
              return pLat && pLng ? haversineKm(userCoords.lat, userCoords.lng, pLat, pLng) : null;
            })();
            const isFar = selDistKm !== null && selDistKm > NEARBY_RADIUS_KM;
            return (
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />

              {/* Travel notice banner for far providers */}
              {isFar && (
                <View style={styles.travelNoticeBanner}>
                  <AlertCircle size={13} color="#92400E" />
                  <Text style={styles.travelNoticeText}>
                    Provider is {selDistKm!.toFixed(1)} km away — travel expenses may apply
                  </Text>
                </View>
              )}

              <View style={styles.sheetHeader}>
                <Avatar
                  uri={selectedProvider.userId?.profileImage}
                  name={selectedProvider.userId?.name || 'Provider'}
                  size={50}
                  isOnline={true}
                />
                <View style={styles.sheetInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.sheetName} numberOfLines={1}>
                      {selectedProvider.userId?.name || 'Verified Provider'}
                    </Text>
                    <ShieldCheck size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
                  </View>
                  <Text style={styles.sheetCategory}>{selectedProvider.category}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Rating score={selectedProvider.averageRating} reviewsCount={selectedProvider.totalReviews} size={12} />
                    {selDistKm !== null && (
                      <View style={[styles.distanceChip, isFar && styles.distanceChipFar]}>
                        <MapPin size={11} color={isFar ? '#D97706' : COLORS.textMuted} />
                        <Text style={[styles.distanceText, isFar && styles.distanceTextFar]}>
                          {formatDistanceLabel(selDistKm)}
                        </Text>
                      </View>
                    )}
                  </View>
                  {selectedProvider.location?.address ? (
                    <Text style={styles.sheetAddress} numberOfLines={1}>
                      📍 {selectedProvider.location.address}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Pricing & Actions */}
              <View style={styles.sheetActionRow}>
                <View>
                  <Text style={styles.rateLabel}>Hourly Rate</Text>
                  <Text style={styles.rateValue}>
                    ${selectedProvider.hourlyRate}
                    <Text style={styles.rateUnit}>/hr</Text>
                  </Text>
                </View>

                <View style={styles.buttonGroup}>
                  <Button
                    title="Profile"
                    variant="outline"
                    size="sm"
                    onPress={() => router.push(`/provider/${selectedProvider._id}`)}
                    style={{ marginRight: 8, paddingHorizontal: 12 }}
                  />
                  <Button
                    title="Book Now"
                    variant="accent"
                    size="sm"
                    onPress={() =>
                      router.push({
                        pathname: '/booking/new',
                        params: {
                          providerId: selectedProvider.userId?._id || selectedProvider._id,
                          providerName: selectedProvider.userId?.name || 'Provider',
                          category: selectedProvider.category,
                          rate: selectedProvider.hourlyRate,
                        },
                      })
                    }
                    icon={<Zap size={14} color="#FFFFFF" />}
                  />
                </View>
              </View>
            </View>
            );
          })()}
        </View>
      ) : (
        <FlatList
          data={filteredProviders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const isFar = item._distanceKm !== null && item._distanceKm > NEARBY_RADIUS_KM;
            const distLabel = item._distanceKm !== null ? formatDistanceLabel(item._distanceKm) : undefined;
            return (
              <View>
                {isFar && (
                  <View style={styles.travelNoticeCard}>
                    <AlertCircle size={12} color="#92400E" />
                    <Text style={styles.travelNoticeCardText}>
                      {item._distanceKm!.toFixed(1)} km away — travel charges may apply
                    </Text>
                  </View>
                )}
                <ProviderCard
                  provider={{
                    ...item,
                    distance: distLabel,
                  }}
                  onPress={() => router.push(`/provider/${item._id}`)}
                  onBookNow={() =>
                    router.push({
                      pathname: '/booking/new',
                      params: {
                        providerId: item.userId?._id || item._id,
                        providerName: item.userId?.name || 'Verified Pro',
                        category: item.category,
                        rate: item.hourlyRate,
                      },
                    })
                  }
                />
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyListTitle}>No Providers Found</Text>
              <Text style={styles.emptyListSubtitle}>
                {debouncedQuery.trim()
                  ? `No providers found for "${debouncedQuery}". Try a different location or service.`
                  : 'No active service providers found in your area.'}
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
  topBar: {
    backgroundColor: COLORS.surface,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    gap: 10,
    marginBottom: 10,
  },
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.textMain,
  },
  toggleViewBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  categoryScroll: {
    paddingHorizontal: SPACING.screenPadding,
    gap: 8,
  },
  categoryPill: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryPillInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  mapWrapper: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sheetInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sheetName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  sheetCategory: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginVertical: 2,
  },
  distanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  sheetActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rateLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  rateValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  rateUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContainer: {
    padding: SPACING.screenPadding,
    paddingBottom: 40,
  },
  emptyList: {
    padding: 32,
    alignItems: 'center',
  },
  emptyListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  emptyListSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  travelNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  travelNoticeText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
    flexShrink: 1,
  },
  travelNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 4,
    marginHorizontal: 0,
  },
  travelNoticeCardText: {
    fontSize: 11,
    color: '#78350F',
    fontWeight: '600',
    flexShrink: 1,
  },
  distanceChipFar: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  distanceTextFar: {
    color: '#D97706',
    fontWeight: '600',
  },
  sheetAddress: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
