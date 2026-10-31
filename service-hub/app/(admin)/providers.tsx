import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';
import { adminService } from '../../services/other.services';
import { CheckCircle, XCircle, Award, DollarSign } from 'lucide-react-native';

export default function AdminProviders() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    confirmText?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProviders();
      setProviders(data || []);
    } catch (e) {
      console.warn('Error fetching providers for approval', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApproval = async (userId: string, isApproved: boolean) => {
    try {
      await adminService.approveProvider(userId, isApproved);
      setAlertConfig({
        visible: true,
        title: 'Decision Recorded',
        message: `Provider has been successfully ${isApproved ? 'approved and activated' : 'rejected'}.`,
        type: isApproved ? 'success' : 'info',
        confirmText: 'Done',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          fetchProviders();
        },
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Update Error',
        message: 'Failed to update provider approval status.',
        type: 'error',
        confirmText: 'Dismiss',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Provider Verification</Text>
        <Text style={styles.subtitle}>Review certifications and approve technicians</Text>
      </View>

      <FlatList
        data={providers}
        keyExtractor={(item) => item.user._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProviders();
            }}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.providerCard}>
            <View style={styles.topRow}>
              <Avatar
                uri={item.user.profileImage}
                name={item.user.name}
                size={48}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.user.name}</Text>
                <Text style={styles.email}>{item.user.email}</Text>
                <Text style={styles.category}>
                  {item.profile?.category || 'General Service'} • ${item.profile?.hourlyRate || 40}/hr
                </Text>
              </View>
              <Badge
                status={item.user.isApproved ? 'verified' : 'pending'}
                label={item.user.isApproved ? 'Approved' : 'Pending'}
              />
            </View>

            {item.profile?.bio ? (
              <Text style={styles.bio} numberOfLines={2}>
                {item.profile.bio}
              </Text>
            ) : null}

            {!item.user.isApproved && (
              <View style={styles.actionRow}>
                <Button
                  title="Reject"
                  variant="outline"
                  size="sm"
                  onPress={() => handleApproval(item.user._id, false)}
                  style={{ flex: 1, marginRight: 8, borderColor: COLORS.error }}
                  textStyle={{ color: COLORS.error }}
                  icon={<XCircle size={14} color={COLORS.error} />}
                />
                <Button
                  title="Approve Provider"
                  variant="primary"
                  size="sm"
                  onPress={() => handleApproval(item.user._id, true)}
                  style={{ flex: 1.5 }}
                  icon={<CheckCircle size={14} color="#FFFFFF" />}
                />
              </View>
            )}
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Providers Found</Text>
            <Text style={styles.emptySubtitle}>All registered providers are reviewed.</Text>
          </View>
        }
      />

      <ThemedAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        onConfirm={alertConfig.onConfirm}
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
    paddingBottom: 12,
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
  list: {
    padding: SPACING.screenPadding,
    paddingBottom: 40,
  },
  providerCard: {
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  email: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  category: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  bio: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
    marginTop: 4,
  },
});
