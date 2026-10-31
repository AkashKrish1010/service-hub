import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { User } from 'lucide-react-native';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  isOnline?: boolean;
  iconColor?: string;
  bgColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = 'User',
  size = 48,
  isOnline = false,
  iconColor = COLORS.primary,
  bgColor = '#EFF6FF',
}) => {
  const [imageError, setImageError] = useState(false);

  const hasValidImage = Boolean(uri && uri.trim().length > 0 && !imageError);

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {hasValidImage ? (
        <Image
          source={{ uri }}
          onError={() => setImageError(true)}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: bgColor,
            },
          ]}
        >
          <User size={Math.round(size * 0.52)} color={iconColor} strokeWidth={2.2} />
        </View>
      )}

      {isOnline && (
        <View
          style={[
            styles.onlineBadge,
            {
              width: Math.max(10, size * 0.28),
              height: Math.max(10, size * 0.28),
              borderRadius: Math.max(10, size * 0.28) / 2,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: COLORS.border,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
