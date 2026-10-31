import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { adminService } from '../../services/other.services';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(selectedRole === 'all' ? undefined : selectedRole);
      setUsers(data || []);
    } catch (e) {
      console.warn('Error loading users', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTabs = ['all', 'customer', 'provider', 'admin'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>All registered accounts across roles</Text>
      </View>

      <View style={styles.tabsRow}>
        {filterTabs.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setSelectedRole(r)}
            style={[styles.tab, selectedRole === r && styles.tabActive]}
          >
            <Text style={[styles.tabText, selectedRole === r && styles.tabTextActive]}>
              {r.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchUsers();
            }}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.userCard}>
            <Avatar uri={item.profileImage} name={item.name} size={44} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.phone}>{item.phone || 'No phone set'}</Text>
            </View>
            <Badge
              status={item.role === 'admin' ? 'verified' : item.role === 'provider' ? 'ongoing' : 'accepted'}
              label={item.role.toUpperCase()}
            />
          </Card>
        )}
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.screenPadding,
    gap: 8,
    marginVertical: 10,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: SPACING.screenPadding,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  email: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  phone: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
