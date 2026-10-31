import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Bell, Search, Sparkles } from 'lucide-react-native';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../store/authStore';

interface TopNavbarProps {
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  subtitle?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  subtitle,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {/* Brand Logo & Name */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.brandContainer}
        onPress={() => {
          if (user?.role === 'provider') {
            router.push('/(provider)/dashboard');
          } else if (user?.role === 'admin') {
            router.push('/(admin)/dashboard');
          } else {
            router.push('/(customer)');
          }
        }}
      >
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.nameBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>Service Hub</Text>
            <View style={styles.verifiedTag}>
              <Sparkles size={10} color={COLORS.primary} />
              <Text style={styles.verifiedText}>PRO</Text>
            </View>
          </View>
          <Text style={styles.brandSubtitle}>
            {subtitle || 'Verified Local Pros'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Right Action Icons */}
      <View style={styles.actions}>
        {showSearch && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(customer)/search')}
            accessibilityLabel="Search services"
          >
            <Search size={18} color={COLORS.textMain} />
          </TouchableOpacity>
        )}

        {showNotifications && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(customer)/notifications')}
            accessibilityLabel="Notifications"
          >
            <Bell size={18} color={COLORS.textMain} />
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        )}

        {showProfile && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => {
              if (user?.role === 'provider') {
                router.push('/(provider)/profile-setup');
              } else if (user?.role === 'admin') {
                router.push('/(admin)/profile');
              } else {
                router.push('/(customer)/profile');
              }
            }}
            accessibilityLabel="My Profile"
          >
            <Avatar
              uri={user?.profileImage}
              name={user?.name || 'User'}
              size={34}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  nameBlock: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.4,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  profileButton: {
    marginLeft: 2,
  },
});
