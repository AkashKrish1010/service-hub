import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, CheckCheck, Zap } from 'lucide-react-native';
import { COLORS, RADIUS } from '../../constants/theme';
import { Button } from '../ui/Button';
import { Rating } from '../ui/Rating';
import { Avatar } from '../ui/Avatar';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestion?: {
    providerId: string;
    name: string;
    category: string;
    rating: number;
    hourlyRate: number;
    distance: string;
    profileImage?: string;
  };
}

interface AIChatBubbleProps {
  message: ChatMessage;
  onBookProvider?: (provider: any) => void;
}

export const AIChatBubble: React.FC<AIChatBubbleProps> = ({
  message,
  onBookProvider,
}) => {
  const isUser = message.sender === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <Sparkles size={14} color="#FFFFFF" />
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
          {message.text}
        </Text>

        {message.suggestion && (
          <View style={styles.providerCard}>
            <View style={styles.providerRow}>
              <Avatar
                uri={message.suggestion.profileImage}
                name={message.suggestion.name}
                size={44}
              />
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{message.suggestion.name}</Text>
                <Text style={styles.providerCategory}>
                  {message.suggestion.category} • {message.suggestion.distance}
                </Text>
                <Rating score={message.suggestion.rating} size={11} showReviews={false} />
              </View>
              <Text style={styles.providerRate}>${message.suggestion.hourlyRate}/hr</Text>
            </View>

            {onBookProvider && (
              <Button
                title={`Book Now with ${message.suggestion.name.split(' ')[0]}`}
                variant="accent"
                size="sm"
                onPress={() => onBookProvider(message.suggestion)}
                icon={<Zap size={13} color="#FFFFFF" />}
                style={{ marginTop: 10 }}
              />
            )}
          </View>
        )}

        <View style={styles.metaRow}>
          <Text style={[styles.time, isUser ? styles.userTime : styles.aiTime]}>
            {message.timestamp}
          </Text>
          {isUser && <CheckCheck size={12} color="#BFDBFE" style={{ marginLeft: 4 }} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: RADIUS.lg,
    padding: 12,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopLeftRadius: RADIUS.xs,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: RADIUS.xs,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiText: {
    color: COLORS.textMain,
  },
  userText: {
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  time: {
    fontSize: 10,
  },
  aiTime: {
    color: COLORS.textMuted,
  },
  userTime: {
    color: '#BFDBFE',
  },
  providerCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginTop: 10,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  providerCategory: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginVertical: 2,
  },
  providerRate: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
